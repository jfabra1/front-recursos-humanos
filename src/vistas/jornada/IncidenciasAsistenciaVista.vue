<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { PhWarningOctagon } from "@phosphor-icons/vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import SelectorSede from "@/componentes/comunes/SelectorSede.vue";
import { useIncidenciasAsistenciaStore } from "@/stores/incidenciasAsistencia.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_ESTADO_INCIDENCIA, ETIQUETAS_ESTADO_INCIDENCIA, ETIQUETAS_TIPO_INCIDENCIA } from "@/utils/jornada.util";

const incidenciasStore = useIncidenciasAsistenciaStore();
const empleadosStore = useEmpleadosStore();
const { puede } = usePermisos();

const sedeSeleccionada = ref("");
const procesandoId = ref(null);

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
});

watch(sedeSeleccionada, (sedeSlug) => {
  if (sedeSlug) incidenciasStore.cargarIncidencias(sedeSlug);
});

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}

async function manejarEnRevision(incidencia) {
  procesandoId.value = incidencia._id;
  await incidenciasStore.marcarEnRevision(incidencia._id);
  procesandoId.value = null;
}

async function manejarResolver(incidencia) {
  procesandoId.value = incidencia._id;
  await incidenciasStore.resolver(incidencia._id);
  procesandoId.value = null;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Incidencias de asistencia</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Tardanzas, omisiones, bloqueos y otras incidencias detectadas automáticamente.</p>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <div class="w-56"><SelectorSede v-model="sedeSeleccionada" /></div>
      <BaseSelect
        v-model="incidenciasStore.filtros.estado"
        label="Estado"
        placeholder="Todos"
        class="w-48"
        :opciones="OPCIONES_ESTADO_INCIDENCIA"
        @update:model-value="sedeSeleccionada && incidenciasStore.cargarIncidencias(sedeSeleccionada)"
      />
    </div>

    <BaseAlerta v-if="!sedeSeleccionada" tipo="info" class="mt-6">Selecciona una sede para ver sus incidencias.</BaseAlerta>

    <template v-else>
      <BaseAlerta v-if="incidenciasStore.error" tipo="error" class="mt-6">{{ incidenciasStore.error }}</BaseAlerta>
      <BaseAlerta v-if="incidenciasStore.errorAccion" tipo="error" class="mt-6">{{ incidenciasStore.errorAccion }}</BaseAlerta>

      <p v-if="incidenciasStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando incidencias…</p>

      <div
        v-else-if="incidenciasStore.incidencias.length === 0"
        class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhWarningOctagon class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">No hay incidencias con estos filtros.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="incidencia in incidenciasStore.incidencias" :key="incidencia._id" class="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <div class="flex items-center gap-2.5">
              <p class="text-sm font-medium text-texto">{{ nombreEmpleado(incidencia.empleadoId) }}</p>
              <span class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">{{ ETIQUETAS_TIPO_INCIDENCIA[incidencia.tipo] }}</span>
              <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_INCIDENCIA[incidencia.estado] }}</span>
            </div>
            <p v-if="incidencia.detalle" class="mt-1 text-xs text-texto-sutil">{{ incidencia.detalle }}</p>
          </div>
          <div v-if="incidencia.estado !== 'resuelta' && puede(MODULOS.INCIDENCIA_ASISTENCIA, ACCIONES.EDITAR)" class="flex shrink-0 items-center gap-2">
            <BaseBoton
              v-if="incidencia.estado === 'abierta'"
              ancho="auto"
              variante="secundario"
              :cargando="procesandoId === incidencia._id"
              @click="manejarEnRevision(incidencia)"
            >
              Poner en revisión
            </BaseBoton>
            <BaseBoton ancho="auto" :cargando="procesandoId === incidencia._id" @click="manejarResolver(incidencia)"> Resolver </BaseBoton>
          </div>
        </li>
      </ul>

      <BasePaginacion
        v-if="incidenciasStore.paginacion && incidenciasStore.paginacion.totalPaginas > 1"
        :paginacion="incidenciasStore.paginacion"
        @anterior="incidenciasStore.irAPaginaAnterior"
        @siguiente="incidenciasStore.irAPaginaSiguiente"
      />
    </template>
  </div>
</template>
