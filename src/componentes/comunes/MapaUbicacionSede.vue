<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { PhCrosshair } from "@phosphor-icons/vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Carga el mapa SOLO mientras este componente está montado (el modal de crear/editar sede lo
// desmonta al cerrarse) — a propósito, para no gastar "cargas de mapa" del plan gratuito de
// Mapbox (50.000/mes) en ningún otro lugar de la app, como un listado con una fila por sede.
const props = defineProps({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  radioMetros: { type: Number, default: 100 },
  precisionMetros: { type: Number, default: null },
});

const emit = defineEmits(["update:lat", "update:lng", "update:precisionMetros"]);

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const CENTRO_DEFECTO = [-74.0817, 4.6097]; // Bogotá — solo para encuadrar el mapa si no hay coordenadas ni GPS disponible

const contenedor = useTemplateRef("contenedor");
let mapa = null;
let marcador = null;
let observadorTamanio = null;

const ubicando = ref(false);
const errorUbicacion = ref(null);

// Círculo geodésico aproximado (distancia/rumbo esférico) — evita sumar una dependencia solo
// para dibujar un radio sobre el mapa.
function circuloGeoJSON(lat, lng, radioMetros, puntos = 64) {
  const distanciaAngular = radioMetros / 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const coordenadas = [];

  for (let i = 0; i <= puntos; i++) {
    const angulo = (i / puntos) * 2 * Math.PI;
    const latPunto = Math.asin(Math.sin(latRad) * Math.cos(distanciaAngular) + Math.cos(latRad) * Math.sin(distanciaAngular) * Math.cos(angulo));
    const lngPunto =
      lngRad +
      Math.atan2(Math.sin(angulo) * Math.sin(distanciaAngular) * Math.cos(latRad), Math.cos(distanciaAngular) - Math.sin(latRad) * Math.sin(latPunto));
    coordenadas.push([(lngPunto * 180) / Math.PI, (latPunto * 180) / Math.PI]);
  }

  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coordenadas] } };
}

function actualizarCirculoGeocerca(lat, lng) {
  mapa?.getSource("geocerca-circulo")?.setData(circuloGeoJSON(lat, lng, props.radioMetros));
}

// Rango de variación del GPS (el mismo "accuracy" que devuelve el navegador, igual que en el
// celular) — un círculo aparte del de la geocerca, para distinguir visualmente "qué tan preciso
// fue el GPS" de "qué tan grande es el radio de marcación".
function actualizarCirculoPrecision(lat, lng, precisionMetros) {
  const fuente = mapa?.getSource("precision-circulo");
  if (!fuente) return;
  if (precisionMetros == null) {
    fuente.setData({ type: "Feature", geometry: { type: "Polygon", coordinates: [[]] } });
    return;
  }
  fuente.setData(circuloGeoJSON(lat, lng, precisionMetros));
}

function manejarNuevaUbicacion(lngLat) {
  emit("update:lat", Number(lngLat.lat.toFixed(6)));
  emit("update:lng", Number(lngLat.lng.toFixed(6)));
}

// El mismo navigator.geolocation que usaría cualquier navegador móvil — en un laptop sin GPS
// dedicado, el navegador hace lo que pueda (wifi/IP, mucho menos preciso: por eso vale la pena
// mostrar el círculo de precisión, para que el admin vea si conviene ajustar el pin a mano.
function solicitarUbicacionDispositivo(silencioso = false) {
  if (!navigator.geolocation) {
    if (!silencioso) errorUbicacion.value = "Este navegador no soporta geolocalización — marca el punto manualmente en el mapa.";
    return;
  }

  ubicando.value = true;
  errorUbicacion.value = null;

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      ubicando.value = false;
      const { latitude, longitude, accuracy } = posicion.coords;
      marcador?.setLngLat([longitude, latitude]);
      mapa?.flyTo({ center: [longitude, latitude], zoom: 17 });
      manejarNuevaUbicacion({ lat: latitude, lng: longitude });
      emit("update:precisionMetros", Math.round(accuracy));
      if (mapa?.isStyleLoaded()) {
        actualizarCirculoGeocerca(latitude, longitude);
        actualizarCirculoPrecision(latitude, longitude, accuracy);
      }
    },
    (error) => {
      ubicando.value = false;
      // Silencioso en el intento automático al montar (hay un centro por defecto razonable de
      // respaldo) — solo se muestra el error cuando el usuario lo pidió explícitamente.
      if (!silencioso) {
        errorUbicacion.value =
          error.code === error.PERMISSION_DENIED
            ? "Permiso de ubicación denegado — marca el punto manualmente en el mapa."
            : "No se pudo obtener tu ubicación — marca el punto manualmente en el mapa.";
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

onMounted(() => {
  if (!TOKEN) return; // sin token configurado, el template ya muestra el aviso en su lugar

  mapboxgl.accessToken = TOKEN;
  const tieneCoordenadas = props.lat != null && props.lng != null;
  const centro = tieneCoordenadas ? [props.lng, props.lat] : CENTRO_DEFECTO;

  mapa = new mapboxgl.Map({
    container: contenedor.value,
    style: "mapbox://styles/mapbox/streets-v12",
    center: centro,
    zoom: tieneCoordenadas ? 16 : 11,
  });
  mapa.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

  // El modal (<dialog>.showModal()) puede terminar de animarse/calcular su tamaño final DESPUÉS
  // de que este mapa ya se inicializó con el tamaño que el contenedor tenía en ese instante — el
  // síntoma clásico es el canvas de WebGL mostrando solo una mitad y el resto en negro. Un
  // ResizeObserver lo corrige llamando resize() cada vez que el contenedor realmente cambia de
  // tamaño, sin depender de adivinar un setTimeout.
  observadorTamanio = new ResizeObserver(() => mapa?.resize());
  observadorTamanio.observe(contenedor.value);

  marcador = new mapboxgl.Marker({ draggable: true }).setLngLat(centro).addTo(mapa);
  marcador.on("dragend", () => {
    emit("update:precisionMetros", null); // ya no refleja una lectura real de GPS, fue un ajuste manual
    manejarNuevaUbicacion(marcador.getLngLat());
  });
  mapa.on("click", (evento) => {
    marcador.setLngLat(evento.lngLat);
    emit("update:precisionMetros", null);
    manejarNuevaUbicacion(evento.lngLat);
  });

  mapa.on("load", () => {
    mapa.addSource("geocerca-circulo", { type: "geojson", data: circuloGeoJSON(centro[1], centro[0], props.radioMetros) });
    mapa.addLayer({ id: "geocerca-circulo-relleno", type: "fill", source: "geocerca-circulo", paint: { "fill-color": "#4f7cff", "fill-opacity": 0.15 } });
    mapa.addLayer({ id: "geocerca-circulo-borde", type: "line", source: "geocerca-circulo", paint: { "line-color": "#4f7cff", "line-width": 2 } });

    mapa.addSource("precision-circulo", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [[]] } } });
    mapa.addLayer({
      id: "precision-circulo-borde",
      type: "line",
      source: "precision-circulo",
      paint: { "line-color": "#f59e0b", "line-width": 2, "line-dasharray": [2, 2] },
    });

    // Nueva sede sin coordenadas todavía: intenta ubicar con el GPS/ubicación del dispositivo
    // automáticamente; si falla o no hay permiso, se queda en el centro por defecto y el admin
    // ajusta a mano — nunca bloquea el formulario.
    if (!tieneCoordenadas) solicitarUbicacionDispositivo(true);
  });
});

// Si el padre cambia lat/lng por fuera (ej. al precargar el formulario de "Editar"), reflejarlo.
watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (lat == null || lng == null || !mapa || !marcador) return;
    marcador.setLngLat([lng, lat]);
    if (mapa.isStyleLoaded()) actualizarCirculoGeocerca(lat, lng);
  },
);

watch(
  () => props.radioMetros,
  () => {
    if (props.lat != null && props.lng != null && mapa?.isStyleLoaded()) actualizarCirculoGeocerca(props.lat, props.lng);
  },
);

onBeforeUnmount(() => {
  observadorTamanio?.disconnect();
  mapa?.remove();
});
</script>

<template>
  <div v-if="!TOKEN" class="flex h-72 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-borde-fuerte text-center">
    <p class="px-6 text-sm text-texto-sutil">
      Falta configurar <code class="text-texto">VITE_MAPBOX_TOKEN</code> para habilitar el mapa interactivo.
    </p>
  </div>
  <template v-else>
    <div class="relative">
      <div ref="contenedor" class="h-72 w-full overflow-hidden rounded-xl border border-borde-fuerte" />
      <button
        type="button"
        class="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg border border-borde bg-fondo-elevado px-2.5 py-1.5 text-xs font-medium text-texto shadow-[var(--sombra-panel)] transition-colors hover:bg-fondo disabled:opacity-60"
        :disabled="ubicando"
        aria-label="Usar mi ubicación actual"
        title="Usar mi ubicación actual"
        @click="solicitarUbicacionDispositivo(false)"
      >
        <PhCrosshair class="size-4" :class="{ 'animate-spin': ubicando }" />
        {{ ubicando ? "Ubicando…" : "Usar mi ubicación actual" }}
      </button>
    </div>
    <p v-if="errorUbicacion" class="mt-1.5 text-xs text-error">{{ errorUbicacion }}</p>
    <p v-if="precisionMetros != null" class="mt-1.5 text-xs text-texto-sutil">
      Precisión del GPS: ±{{ precisionMetros }} m (círculo punteado en el mapa) — entre más bajo, más confiable.
    </p>
  </template>
</template>
