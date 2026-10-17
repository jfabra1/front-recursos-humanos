<script setup>
import { onMounted, reactive, ref } from "vue";
import { PhMapPin, PhPencilSimple, PhPlus, PhProhibit } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import MapaUbicacionSede from "@/componentes/comunes/MapaUbicacionSede.vue";
import { useSedesStore } from "@/stores/sedes.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const sedesStore = useSedesStore();
const { puede } = usePermisos();

onMounted(() => {
  sedesStore.cargarPaginaSedes();
});

const modalAbierto = ref(false);
const sedeEditando = ref(null);
const confirmandoId = ref(null);

const formulario = reactive({ nombre: "", direccion: "", lat: null, lng: null, radioMetros: "100", precisionMetros: null });

function abrirCrear() {
  sedeEditando.value = null;
  Object.assign(formulario, { nombre: "", direccion: "", lat: null, lng: null, radioMetros: "100", precisionMetros: null });
  modalAbierto.value = true;
}

function abrirEditar(sede) {
  sedeEditando.value = sede;
  Object.assign(formulario, {
    nombre: sede.nombre,
    direccion: sede.direccion || "",
    lat: sede.geocerca.lat,
    lng: sede.geocerca.lng,
    radioMetros: sede.geocerca.radioMetros ? String(sede.geocerca.radioMetros) : "100",
    precisionMetros: null, // al editar, cualquier ajuste del pin se trata como manual hasta que se re-ubique con el GPS
  });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  const datos = {
    nombre: formulario.nombre,
    direccion: formulario.direccion || undefined,
    geocerca: {
      lat: formulario.lat,
      lng: formulario.lng,
      ...(formulario.radioMetros ? { radioMetros: Number(formulario.radioMetros) } : {}),
      ...(formulario.precisionMetros != null ? { precisionMetros: formulario.precisionMetros } : {}),
    },
  };

  const exito = sedeEditando.value
    ? await sedesStore.actualizarSede(sedeEditando.value._id, datos)
    : await sedesStore.crearSede(datos);

  if (exito) modalAbierto.value = false;
}

function manejarAnular(sede) {
  if (confirmandoId.value !== sede._id) {
    confirmandoId.value = sede._id;
    setTimeout(() => {
      if (confirmandoId.value === sede._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  sedesStore.anularSede(sede._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Sedes</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Ubicaciones operativas de la empresa.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.SEDE, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nueva sede
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput
        v-model="sedesStore.filtros.nombre"
        label="Buscar"
        placeholder="Nombre de la sede"
        class="w-64"
        @keyup.enter="sedesStore.cargarPaginaSedes"
      />
      <BaseBoton ancho="auto" variante="secundario" @click="sedesStore.cargarPaginaSedes">Buscar</BaseBoton>
    </div>

    <BaseAlerta v-if="sedesStore.error" tipo="error" class="mt-6">{{ sedesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="sedesStore.errorAccion" tipo="error" class="mt-6">{{ sedesStore.errorAccion }}</BaseAlerta>

    <p v-if="sedesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando sedes…</p>

    <div v-else-if="sedesStore.sedesPagina.length === 0" class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center">
      <PhMapPin class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no has registrado ninguna sede.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="sede in sedesStore.sedesPagina" :key="sede._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ sede.nombre }}</p>
            <span v-if="!sede.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactiva</span>
          </div>
          <p class="mt-0.5 text-xs text-texto-sutil">{{ sede.direccion || "Sin dirección registrada" }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="puede(MODULOS.SEDE, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            title="Editar"
            @click="abrirEditar(sede)"
          >
            <PhPencilSimple class="size-[18px]" />
          </button>
          <button
            v-if="sede.activo && puede(MODULOS.SEDE, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === sede._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(sede)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === sede._id ? "¿Confirmar?" : "Desactivar" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="sedesStore.paginacionSedes"
      :paginacion="sedesStore.paginacionSedes"
      :limite="sedesStore.limite"
      @anterior="sedesStore.irAPaginaAnteriorSedes"
      @siguiente="sedesStore.irAPaginaSiguienteSedes"
      @cambiar-limite="sedesStore.cambiarLimiteSedes"
    />

    <BaseModal v-model="modalAbierto" :titulo="sedeEditando ? 'Editar sede' : 'Nueva sede'" ancho="lg">
      <BaseAlerta v-if="sedesStore.errorGuardado" tipo="error" class="mb-5">{{ sedesStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Sede principal" requerido />
        <BaseInput v-model="formulario.direccion" label="Dirección" placeholder="Calle 10 # 5-20, Medellín" />

        <div>
          <label class="text-sm font-medium text-texto">Ubicación</label>
          <p class="mt-1 text-xs text-texto-sutil">Haz clic en el mapa o arrastra el marcador para fijar el punto exacto de la sede.</p>
          <MapaUbicacionSede
            v-model:lat="formulario.lat"
            v-model:lng="formulario.lng"
            v-model:precision-metros="formulario.precisionMetros"
            :radio-metros="Number(formulario.radioMetros) || 100"
            class="mt-2"
          />
          <p v-if="formulario.lat != null" class="mt-1.5 font-mono text-xs text-texto-sutil">{{ formulario.lat }}, {{ formulario.lng }}</p>
        </div>

        <BaseInput v-model="formulario.radioMetros" type="number" label="Radio de geocerca (metros)" placeholder="100" />
        <BaseBoton tipo="submit" :cargando="sedesStore.guardando" class="mt-2">
          {{ sedeEditando ? "Guardar cambios" : "Crear sede" }}
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
