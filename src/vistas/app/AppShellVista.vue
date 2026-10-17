<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import {
  PhArrowsClockwise,
  PhBellRinging,
  PhBriefcase,
  PhCalendarCheck,
  PhCalendarX,
  PhCaretDown,
  PhClipboardText,
  PhClockCountdown,
  PhDeviceMobile,
  PhFileCsv,
  PhFileX,
  PhFirstAidKit,
  PhGear,
  PhHourglass,
  PhHouse,
  PhList,
  PhMapPin,
  PhScales,
  PhShieldCheck,
  PhSignature,
  PhSignOut,
  PhSquaresFour,
  PhUserCircle,
  PhUserGear,
  PhUsers,
  PhWarningOctagon,
  PhX,
} from "@phosphor-icons/vue";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";
import { useAutenticacionStore } from "@/stores/autenticacion.store";
import { useNotificacionesStore } from "@/stores/notificaciones.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const autenticacion = useAutenticacionStore();
const notificacionesStore = useNotificacionesStore();
const router = useRouter();
const route = useRoute();
const { puede } = usePermisos();

const menuMovilAbierto = ref(false);
const anioActual = new Date().getFullYear();

// La inicial del correo identifica al usuario en la burbuja de perfil del header (sin foto de
// perfil en el modelo todavía) — "Mi perfil" ya no vive como enlace del sidebar, se accede desde ahí.
const inicialUsuario = computed(() => autenticacion.usuario?.email?.[0]?.toUpperCase() || "?");

const todasLasSecciones = [
  {
    titulo: null,
    enlaces: [{ nombre: "panel-inicio", texto: "Inicio", icono: PhHouse }],
  },
  {
    titulo: "Organización",
    enlaces: [
      { nombre: "sedes-listado", texto: "Sedes", icono: PhMapPin, modulo: MODULOS.SEDE },
      { nombre: "areas-listado", texto: "Áreas", icono: PhSquaresFour, modulo: MODULOS.AREA },
      { nombre: "cargos-listado", texto: "Cargos", icono: PhBriefcase, modulo: MODULOS.CARGO },
    ],
  },
  {
    titulo: "Personas",
    enlaces: [
      { nombre: "empleados-listado", texto: "Empleados", icono: PhUsers, modulo: MODULOS.EMPLEADO },
      { nombre: "contratos-por-vencer", texto: "Contratos por vencer", icono: PhCalendarX, modulo: MODULOS.CONTRATO },
      {
        nombre: "instrumentos-colectivos-listado",
        texto: "Convenciones colectivas",
        icono: PhScales,
        modulo: MODULOS.INSTRUMENTO_COLECTIVO,
      },
      { nombre: "plantillas-contrato-listado", texto: "Plantillas de contrato", icono: PhSignature, modulo: MODULOS.PLANTILLA_CONTRATO },
      { nombre: "cartas-renuncia-listado", texto: "Cartas de renuncia", icono: PhFileX, modulo: MODULOS.CARTA_RENUNCIA },
    ],
  },
  {
    titulo: "Jornada y asistencia",
    enlaces: [
      { nombre: "horarios-listado", texto: "Horarios", icono: PhClockCountdown, modulo: MODULOS.HORARIO },
      { nombre: "turnos-listado", texto: "Turnos", icono: PhCalendarCheck, modulo: MODULOS.TURNO },
      { nombre: "asignaciones-horario-listado", texto: "Asignación de horarios", icono: PhArrowsClockwise, modulo: MODULOS.TURNO },
      { nombre: "asistencia-listado", texto: "Asistencia", icono: PhClockCountdown, modulo: MODULOS.ASISTENCIA },
      {
        nombre: "correcciones-marcacion-listado",
        texto: "Correcciones de marcación",
        icono: PhWarningOctagon,
        modulo: MODULOS.INCIDENCIA_ASISTENCIA,
      },
      { nombre: "incidencias-asistencia-listado", texto: "Incidencias", icono: PhWarningOctagon, modulo: MODULOS.INCIDENCIA_ASISTENCIA },
      { nombre: "cierres-asistencia-listado", texto: "Cierres", icono: PhClipboardText, modulo: MODULOS.CIERRE_ASISTENCIA },
      { nombre: "horas-extra-listado", texto: "Horas extra", icono: PhHourglass, modulo: MODULOS.HORA_EXTRA },
      {
        nombre: "dispositivos-pendientes",
        texto: "Dispositivos pendientes",
        icono: PhDeviceMobile,
        modulo: MODULOS.DISPOSITIVO,
        accion: ACCIONES.EDITAR, // GET /pendientes exige EDITAR en el backend, no LEER
      },
    ],
  },
  {
    titulo: "Ausencias",
    enlaces: [
      { nombre: "vacaciones-listado", texto: "Vacaciones", icono: PhCalendarCheck, modulo: MODULOS.VACACION },
      { nombre: "permisos-listado", texto: "Permisos y licencias", icono: PhClipboardText, modulo: MODULOS.PERMISO },
      { nombre: "incapacidades-listado", texto: "Incapacidades", icono: PhFirstAidKit, modulo: MODULOS.INCAPACIDAD },
    ],
  },
  {
    titulo: "Administración",
    enlaces: [
      { nombre: "roles-listado", texto: "Roles y permisos", icono: PhShieldCheck, modulo: MODULOS.ROL },
      { nombre: "usuarios-listado", texto: "Usuarios", icono: PhUserGear, modulo: MODULOS.USUARIO },
      { nombre: "auditoria-listado", texto: "Auditoría", icono: PhClipboardText, modulo: MODULOS.AUDITORIA },
      { nombre: "reportes-listado", texto: "Reportes", icono: PhFileCsv, modulo: MODULOS.REPORTE },
      { nombre: "empresa-configuracion", texto: "Configuración", icono: PhGear, modulo: MODULOS.EMPRESA },
    ],
  },
];

const secciones = computed(() =>
  todasLasSecciones
    .map((seccion) => ({
      ...seccion,
      enlaces: seccion.enlaces.filter((enlace) => !enlace.modulo || puede(enlace.modulo, enlace.accion || ACCIONES.LEER)),
    }))
    .filter((seccion) => seccion.enlaces.length > 0),
);

// Cada sección con título se puede plegar/desplegar de forma independiente (varias a la vez,
// no es un acordeón de una sola). La que contiene la ruta activa se abre sola, al entrar o al
// navegar por URL directa — sin cerrar las que el usuario ya haya abierto manualmente.
const seccionesAbiertas = ref(new Set());

function seccionAbierta(titulo) {
  return seccionesAbiertas.value.has(titulo);
}

function alternarSeccion(titulo) {
  const nuevas = new Set(seccionesAbiertas.value);
  if (nuevas.has(titulo)) nuevas.delete(titulo);
  else nuevas.add(titulo);
  seccionesAbiertas.value = nuevas;
}

function abrirSeccionDeRutaActual() {
  const seccionActual = todasLasSecciones.find((seccion) => seccion.enlaces.some((enlace) => enlace.nombre === route.name));
  if (!seccionActual?.titulo || seccionAbierta(seccionActual.titulo)) return;
  const nuevas = new Set(seccionesAbiertas.value);
  nuevas.add(seccionActual.titulo);
  seccionesAbiertas.value = nuevas;
}

watch(() => route.name, abrirSeccionDeRutaActual);

onMounted(() => {
  abrirSeccionDeRutaActual();
  if (puede(MODULOS.NOTIFICACION, ACCIONES.LEER)) notificacionesStore.cargarNoLeidas();
});

async function cerrarSesion() {
  await autenticacion.cerrarSesion();
  router.push({ name: "iniciar-sesion" });
}
</script>

<template>
  <div class="h-dvh overflow-hidden bg-fondo lg:grid lg:grid-cols-[260px_1fr]">
    <!-- Sidebar (desktop) / panel deslizable (mobile) — con scroll propio, independiente del contenido -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-borde bg-fondo-elevado transition-transform duration-200 ease-[var(--ease-salida)] lg:static lg:h-dvh lg:translate-x-0"
      :class="menuMovilAbierto && 'translate-x-0'"
    >
      <div class="flex shrink-0 items-center justify-between p-5 pb-0">
        <RouterLink :to="{ name: 'panel-inicio' }" class="flex items-center gap-2.5">
          <span class="flex size-8 items-center justify-center rounded-[9px] bg-acento text-base font-bold text-acento-texto" aria-hidden="true">S</span>
          <span class="text-lg font-semibold tracking-tight text-texto">SGTH</span>
        </RouterLink>
        <button type="button" class="text-texto-sutil lg:hidden" aria-label="Cerrar menú" title="Cerrar menú" @click="menuMovilAbierto = false">
          <PhX class="size-5" />
        </button>
      </div>

      <nav class="mt-6 flex-1 overflow-y-auto px-5 pb-5">
        <div v-for="seccion in secciones" :key="seccion.titulo || 'inicio'" class="mb-5">
          <button
            v-if="seccion.titulo"
            type="button"
            class="mb-1.5 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold tracking-[0.06em] text-texto-sutil/70 uppercase transition-colors hover:text-texto-sutil"
            @click="alternarSeccion(seccion.titulo)"
          >
            {{ seccion.titulo }}
            <PhCaretDown class="size-3.5 shrink-0 transition-transform duration-150" :class="!seccionAbierta(seccion.titulo) && '-rotate-90'" />
          </button>
          <div v-show="!seccion.titulo || seccionAbierta(seccion.titulo)" class="flex flex-col gap-1">
            <RouterLink
              v-for="enlace in seccion.enlaces"
              :key="enlace.nombre"
              :to="{ name: enlace.nombre }"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              :class="route.name === enlace.nombre ? 'bg-acento/10 text-acento' : 'text-texto-sutil hover:bg-fondo hover:text-texto'"
              @click="menuMovilAbierto = false"
            >
              <component :is="enlace.icono" class="size-[18px]" weight="bold" />
              {{ enlace.texto }}
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="flex shrink-0 flex-col gap-3 border-t border-borde p-5">
        <p class="truncate text-xs text-texto-sutil">{{ autenticacion.usuario?.email }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
          @click="cerrarSesion"
        >
          <PhSignOut class="size-4" />
          Salir
        </button>
      </div>
    </aside>

    <div
      v-if="menuMovilAbierto"
      aria-hidden="true"
      class="fixed inset-0 z-30 bg-texto/20 backdrop-blur-sm lg:hidden"
      @click="menuMovilAbierto = false"
    />

    <!-- Columna derecha: header y footer fijos, solo el contenido del medio hace scroll -->
    <div class="flex h-dvh flex-col overflow-hidden">
      <header class="flex shrink-0 items-center justify-between gap-4 border-b border-borde px-6 py-4">
        <div class="flex items-center gap-4">
          <button type="button" class="text-texto-sutil lg:hidden" aria-label="Abrir menú" title="Abrir menú" @click="menuMovilAbierto = true">
            <PhList class="size-6" />
          </button>
          <span class="text-base font-semibold tracking-tight text-texto lg:hidden">SGTH</span>
        </div>

        <div class="flex items-center gap-2">
          <ConmutadorTema />

          <RouterLink
            v-if="puede(MODULOS.NOTIFICACION, ACCIONES.LEER)"
            :to="{ name: 'notificaciones-listado' }"
            class="relative inline-flex size-10 items-center justify-center rounded-full text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
            aria-label="Notificaciones"
          title="Notificaciones"
          >
            <PhBellRinging class="size-5" weight="bold" />
            <span
              v-if="notificacionesStore.noLeidas > 0"
              class="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[10px] font-semibold text-acento-texto"
            >
              {{ notificacionesStore.noLeidas > 9 ? "9+" : notificacionesStore.noLeidas }}
            </span>
          </RouterLink>

          <div class="group relative">
            <RouterLink
              :to="{ name: 'mi-perfil' }"
              class="flex size-10 items-center justify-center rounded-full bg-acento/10 text-sm font-semibold text-acento transition-colors hover:bg-acento/20"
              :class="route.name === 'mi-perfil' && 'ring-2 ring-acento'"
              :aria-label="`Mi perfil — ${autenticacion.usuario?.email}`"
              :title="`Mi perfil — ${autenticacion.usuario?.email}`"
            >
              {{ inicialUsuario }}
            </RouterLink>

            <!-- Menú al pasar el mouse (o con foco por teclado): el "pt-2" en vez de "mt-2" en
            este contenedor evita el hueco clásico que rompe el :hover al bajar el mouse hacia
            el menú (visibility:hidden sigue ocupando espacio y disparando :hover, display:none no). -->
            <div
              class="invisible absolute top-full right-0 z-50 w-48 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
            >
              <div class="flex flex-col gap-0.5 rounded-xl border border-borde bg-fondo-elevado p-1.5 shadow-[var(--sombra-panel)]">
                <p class="truncate px-3 py-1.5 text-xs text-texto-sutil">{{ autenticacion.usuario?.email }}</p>
                <RouterLink
                  :to="{ name: 'mi-perfil' }"
                  class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
                >
                  <PhUserCircle class="size-4" />
                  Mi perfil
                </RouterLink>
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error"
                  @click="cerrarSesion"
                >
                  <PhSignOut class="size-4" />
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">
        <RouterView />
      </main>

      <footer class="shrink-0 border-t border-borde px-6 py-3 text-center text-xs text-texto-sutil">
        SGTH SaaS © {{ anioActual }} — Gestión de talento humano
      </footer>
    </div>
  </div>
</template>
