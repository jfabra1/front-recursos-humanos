<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  PhArrowRight,
  PhBriefcase,
  PhCalendarCheck,
  PhCalendarX,
  PhClipboardText,
  PhClockCountdown,
  PhDeviceMobile,
  PhFirstAidKit,
  PhBellRinging,
  PhFileCsv,
  PhGear,
  PhHourglass,
  PhMapPin,
  PhScales,
  PhShieldCheck,
  PhSquaresFour,
  PhUserCircle,
  PhUserGear,
  PhUsers,
  PhWarningOctagon,
} from "@phosphor-icons/vue";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const { puede } = usePermisos();

const todasLasSecciones = [
  {
    titulo: "Mi cuenta",
    accesos: [
      { nombre: "mi-perfil", titulo: "Mi perfil", descripcion: "Tus datos, documentos, turnos y la política de privacidad.", icono: PhUserCircle },
      {
        nombre: "notificaciones-listado",
        titulo: "Notificaciones",
        descripcion: "Tu buzón de avisos del sistema.",
        icono: PhBellRinging,
        modulo: MODULOS.NOTIFICACION,
      },
    ],
  },
  {
    titulo: "Organización",
    accesos: [
      { nombre: "sedes-listado", titulo: "Sedes", descripcion: "Ubicaciones y su geocerca.", icono: PhMapPin, modulo: MODULOS.SEDE },
      { nombre: "areas-listado", titulo: "Áreas", descripcion: "Estructura organizativa.", icono: PhSquaresFour, modulo: MODULOS.AREA },
      { nombre: "cargos-listado", titulo: "Cargos", descripcion: "Cargos por área.", icono: PhBriefcase, modulo: MODULOS.CARGO },
    ],
  },
  {
    titulo: "Personas",
    accesos: [
      { nombre: "empleados-listado", titulo: "Empleados", descripcion: "Alta, baja y recontratación.", icono: PhUsers, modulo: MODULOS.EMPLEADO },
      {
        nombre: "contratos-por-vencer",
        titulo: "Contratos por vencer",
        descripcion: "Para renovarlos a tiempo.",
        icono: PhCalendarX,
        modulo: MODULOS.CONTRATO,
      },
      {
        nombre: "instrumentos-colectivos-listado",
        titulo: "Convenciones colectivas",
        descripcion: "Pactos y laudos vigentes.",
        icono: PhScales,
        modulo: MODULOS.INSTRUMENTO_COLECTIVO,
      },
    ],
  },
  {
    titulo: "Jornada y asistencia",
    accesos: [
      { nombre: "turnos-listado", titulo: "Turnos", descripcion: "Horarios asignados por sede.", icono: PhCalendarCheck, modulo: MODULOS.TURNO },
      { nombre: "asistencia-listado", titulo: "Asistencia", descripcion: "Marcaciones por sede.", icono: PhClockCountdown, modulo: MODULOS.ASISTENCIA },
      {
        nombre: "incidencias-asistencia-listado",
        titulo: "Incidencias",
        descripcion: "Tardanzas, bloqueos y más.",
        icono: PhWarningOctagon,
        modulo: MODULOS.INCIDENCIA_ASISTENCIA,
      },
      {
        nombre: "horas-extra-listado",
        titulo: "Horas extra",
        descripcion: "Solicitudes y conciliación contra marcaciones.",
        icono: PhHourglass,
        modulo: MODULOS.HORA_EXTRA,
      },
      {
        nombre: "dispositivos-pendientes",
        titulo: "Dispositivos pendientes",
        descripcion: "Cambios de dispositivo por aprobar.",
        icono: PhDeviceMobile,
        modulo: MODULOS.DISPOSITIVO,
        accion: ACCIONES.EDITAR, // GET /pendientes exige EDITAR en el backend, no LEER
      },
    ],
  },
  {
    titulo: "Vacaciones e incapacidades",
    accesos: [
      { nombre: "vacaciones-listado", titulo: "Vacaciones", descripcion: "Saldo, movimientos y solicitudes.", icono: PhCalendarCheck, modulo: MODULOS.VACACION },
      {
        nombre: "permisos-listado",
        titulo: "Permisos y licencias",
        descripcion: "Solicitudes de permisos y licencias especiales.",
        icono: PhClipboardText,
        modulo: MODULOS.PERMISO,
      },
      {
        nombre: "incapacidades-listado",
        titulo: "Incapacidades",
        descripcion: "Registro y seguimiento de incapacidades médicas.",
        icono: PhFirstAidKit,
        modulo: MODULOS.INCAPACIDAD,
      },
    ],
  },
  {
    titulo: "Administración",
    accesos: [
      {
        nombre: "roles-listado",
        titulo: "Roles y permisos",
        descripcion: "Excepciones a la matriz por defecto.",
        icono: PhShieldCheck,
        modulo: MODULOS.ROL,
      },
      { nombre: "usuarios-listado", titulo: "Usuarios", descripcion: "Cuentas con acceso al sistema.", icono: PhUserGear, modulo: MODULOS.USUARIO },
      { nombre: "auditoria-listado", titulo: "Auditoría", descripcion: "Registro de cambios sensibles.", icono: PhClipboardText, modulo: MODULOS.AUDITORIA },
      {
        nombre: "reportes-listado",
        titulo: "Reportes",
        descripcion: "Exporta datos agregados del sistema a CSV.",
        icono: PhFileCsv,
        modulo: MODULOS.REPORTE,
      },
      {
        nombre: "empresa-configuracion",
        titulo: "Configuración",
        descripcion: "Nombre y parámetros por defecto.",
        icono: PhGear,
        modulo: MODULOS.EMPRESA,
      },
    ],
  },
];

const secciones = computed(() =>
  todasLasSecciones
    .map((seccion) => ({
      ...seccion,
      accesos: seccion.accesos.filter((acceso) => !acceso.modulo || puede(acceso.modulo, acceso.accion || ACCIONES.LEER)),
    }))
    .filter((seccion) => seccion.accesos.length > 0),
);
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Inicio</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Accesos rápidos a lo que más administras en tu empresa.</p>

    <div v-for="seccion in secciones" :key="seccion.titulo" class="mt-10 first:mt-8">
      <h2 class="text-xs font-semibold tracking-[0.06em] text-texto-sutil uppercase">{{ seccion.titulo }}</h2>
      <div class="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="acceso in seccion.accesos"
          :key="acceso.nombre"
          :to="{ name: acceso.nombre }"
          class="group flex flex-col gap-3 rounded-2xl border border-borde bg-fondo-elevado p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sombra-panel)]"
        >
          <span class="flex size-10 items-center justify-center rounded-xl bg-acento/10 text-acento">
            <component :is="acceso.icono" class="size-5" weight="bold" />
          </span>
          <div>
            <h3 class="text-base font-semibold text-texto">{{ acceso.titulo }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-texto-sutil">{{ acceso.descripcion }}</p>
          </div>
          <span class="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-acento">
            Ir a {{ acceso.titulo.toLowerCase() }}
            <PhArrowRight class="size-4 transition-transform duration-150 group-hover:translate-x-0.5" weight="bold" />
          </span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
