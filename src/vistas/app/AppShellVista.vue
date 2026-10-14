<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import {
  PhBellRinging,
  PhBriefcase,
  PhCalendarCheck,
  PhCalendarX,
  PhClipboardText,
  PhClockCountdown,
  PhDeviceMobile,
  PhFileCsv,
  PhFirstAidKit,
  PhGear,
  PhHourglass,
  PhHouse,
  PhList,
  PhMapPin,
  PhScales,
  PhShieldCheck,
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

onMounted(() => {
  if (puede(MODULOS.NOTIFICACION, ACCIONES.LEER)) notificacionesStore.cargarNoLeidas();
});

const todasLasSecciones = [
  {
    titulo: null,
    enlaces: [
      { nombre: "panel-inicio", texto: "Inicio", icono: PhHouse },
      { nombre: "mi-perfil", texto: "Mi perfil", icono: PhUserCircle },
      { nombre: "notificaciones-listado", texto: "Notificaciones", icono: PhBellRinging, modulo: MODULOS.NOTIFICACION },
    ],
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
    ],
  },
  {
    titulo: "Jornada y asistencia",
    enlaces: [
      { nombre: "horarios-listado", texto: "Horarios", icono: PhClockCountdown, modulo: MODULOS.HORARIO },
      { nombre: "turnos-listado", texto: "Turnos", icono: PhCalendarCheck, modulo: MODULOS.TURNO },
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
    titulo: "Vacaciones e incapacidades",
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

async function cerrarSesion() {
  await autenticacion.cerrarSesion();
  router.push({ name: "iniciar-sesion" });
}
</script>

<template>
  <div class="min-h-dvh bg-fondo lg:grid lg:grid-cols-[260px_1fr]">
    <!-- Sidebar (desktop) / panel deslizable (mobile) -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-borde bg-fondo-elevado transition-transform duration-200 ease-[var(--ease-salida)] lg:static lg:translate-x-0"
      :class="menuMovilAbierto && 'translate-x-0'"
    >
      <div class="flex items-center justify-between p-5 pb-0">
        <RouterLink :to="{ name: 'panel-inicio' }" class="flex items-center gap-2.5">
          <span class="flex size-8 items-center justify-center rounded-[9px] bg-acento text-base font-bold text-acento-texto" aria-hidden="true">S</span>
          <span class="text-lg font-semibold tracking-tight text-texto">SGTH</span>
        </RouterLink>
        <button type="button" class="text-texto-sutil lg:hidden" aria-label="Cerrar menú" @click="menuMovilAbierto = false">
          <PhX class="size-5" />
        </button>
      </div>

      <nav class="mt-6 flex-1 overflow-y-auto px-5 pb-5">
        <div v-for="seccion in secciones" :key="seccion.titulo || 'inicio'" class="mb-5">
          <p v-if="seccion.titulo" class="mb-1.5 px-3 text-xs font-semibold tracking-[0.06em] text-texto-sutil/70 uppercase">{{ seccion.titulo }}</p>
          <div class="flex flex-col gap-1">
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
              <span
                v-if="enlace.nombre === 'notificaciones-listado' && notificacionesStore.noLeidas > 0"
                class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-acento px-1.5 text-xs font-semibold text-acento-texto"
              >
                {{ notificacionesStore.noLeidas > 99 ? "99+" : notificacionesStore.noLeidas }}
              </span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="flex flex-col gap-3 border-t border-borde p-5">
        <p class="truncate text-xs text-texto-sutil">{{ autenticacion.usuario?.email }}</p>
        <div class="flex items-center justify-between">
          <ConmutadorTema />
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            @click="cerrarSesion"
          >
            <PhSignOut class="size-4" />
            Salir
          </button>
        </div>
      </div>
    </aside>

    <div
      v-if="menuMovilAbierto"
      aria-hidden="true"
      class="fixed inset-0 z-30 bg-texto/20 backdrop-blur-sm lg:hidden"
      @click="menuMovilAbierto = false"
    />

    <div class="flex min-h-dvh flex-col">
      <header class="flex items-center gap-4 border-b border-borde px-6 py-4 lg:hidden">
        <button type="button" class="text-texto-sutil" aria-label="Abrir menú" @click="menuMovilAbierto = true">
          <PhList class="size-6" />
        </button>
        <span class="text-base font-semibold tracking-tight text-texto">SGTH</span>
      </header>

      <main class="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>
