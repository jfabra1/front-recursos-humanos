<script setup>
import { computed, onMounted, ref } from "vue";
import { PhCheckCircle, PhClipboardText, PhLink, PhXCircle } from "@phosphor-icons/vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import { useCorreccionesMarcacionStore } from "@/stores/correccionesMarcacion.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { ETIQUETAS_TIPO_MARCACION, ETIQUETAS_ESTADO_SOLICITUD_CORRECCION } from "@/utils/jornada.util";

const correccionesStore = useCorreccionesMarcacionStore();
const empleadosStore = useEmpleadosStore();
const { puede } = usePermisos();

const procesandoId = ref(null);

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  correccionesStore.cargarSolicitudes();
});

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}
function formatoFechaHora(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

async function manejarAprobar(solicitud) {
  procesandoId.value = solicitud._id;
  await correccionesStore.aprobar(solicitud._id);
  procesandoId.value = null;
}

async function manejarRechazar(solicitud) {
  procesandoId.value = solicitud._id;
  await correccionesStore.rechazar(solicitud._id);
  procesandoId.value = null;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Correcciones de marcación</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Solicitudes de los empleados para corregir u omitir una marcación.</p>

    <div class="mt-6 w-56">
      <BaseSelect
        v-model="correccionesStore.filtros.estado"
        label="Estado"
        :opciones="[
          { valor: 'pendiente', texto: 'Pendientes' },
          { valor: 'aprobada', texto: 'Aprobadas' },
          { valor: 'rechazada', texto: 'Rechazadas' },
        ]"
        @update:model-value="correccionesStore.cargarSolicitudes"
      />
    </div>

    <BaseAlerta v-if="correccionesStore.error" tipo="error" class="mt-6">{{ correccionesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="correccionesStore.errorAccion" tipo="error" class="mt-6">{{ correccionesStore.errorAccion }}</BaseAlerta>

    <p v-if="correccionesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando solicitudes…</p>

    <div
      v-else-if="correccionesStore.solicitudes.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhClipboardText class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay solicitudes en este estado.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="solicitud in correccionesStore.solicitudes" :key="solicitud._id" class="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ nombreEmpleado(solicitud.empleadoId) }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_TIPO_MARCACION[solicitud.tipoSolicitado] }}</span>
            <span v-if="solicitud.estado !== 'pendiente'" class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">
              {{ ETIQUETAS_ESTADO_SOLICITUD_CORRECCION[solicitud.estado] }}
            </span>
            <span v-if="!solicitud.marcacionId" class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">Omisión total</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">Pide que quede como {{ formatoFechaHora(solicitud.timestampSolicitado) }}</p>
          <p class="mt-1 text-sm text-texto">{{ solicitud.motivo }}</p>
          <a
            v-if="solicitud.evidenciaUrl"
            :href="solicitud.evidenciaUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-1 inline-flex items-center gap-1 text-xs text-acento hover:underline"
          >
            <PhLink class="size-3" />
            Ver evidencia
          </a>
        </div>
        <div v-if="solicitud.estado === 'pendiente' && puede(MODULOS.INCIDENCIA_ASISTENCIA, ACCIONES.EDITAR)" class="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            :disabled="procesandoId === solicitud._id"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error disabled:opacity-50"
            aria-label="Rechazar"
            title="Rechazar"
            @click="manejarRechazar(solicitud)"
          >
            <PhXCircle class="size-5" />
          </button>
          <button
            type="button"
            :disabled="procesandoId === solicitud._id"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-exito/10 hover:text-exito disabled:opacity-50"
            aria-label="Aprobar"
            title="Aprobar"
            @click="manejarAprobar(solicitud)"
          >
            <PhCheckCircle class="size-5" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
