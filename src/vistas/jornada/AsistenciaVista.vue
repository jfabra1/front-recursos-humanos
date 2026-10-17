<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { PhClockCountdown, PhMapPinLine } from "@phosphor-icons/vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import SelectorSede from "@/componentes/comunes/SelectorSede.vue";
import { useMarcacionesStore } from "@/stores/marcaciones.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { ETIQUETAS_TIPO_MARCACION } from "@/utils/jornada.util";

const marcacionesStore = useMarcacionesStore();
const empleadosStore = useEmpleadosStore();

const sedeSeleccionada = ref("");
const filtroEmpleado = ref("");
const filtroTipo = ref("");

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
});

function recargar() {
  if (!sedeSeleccionada.value) return;
  const filtros = {};
  if (filtroEmpleado.value) filtros.empleadoId = filtroEmpleado.value;
  if (filtroTipo.value) filtros.tipo = filtroTipo.value;
  marcacionesStore.cargarMarcaciones(sedeSeleccionada.value, filtros);
}

watch(sedeSeleccionada, recargar);

const opcionesEmpleados = computed(() =>
  empleadosStore.empleados.map((empleado) => ({ valor: empleado._id, texto: `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` })),
);

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}
function formatoFechaHora(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Asistencia</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Marcaciones registradas por sede. Marcar es autogestión del empleado, aquí solo se consulta.</p>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <div class="w-56"><SelectorSede v-model="sedeSeleccionada" /></div>
      <BaseSelect v-model="filtroEmpleado" label="Empleado" placeholder="Todos" class="w-56" :opciones="opcionesEmpleados" @update:model-value="recargar" />
      <BaseSelect
        v-model="filtroTipo"
        label="Tipo"
        placeholder="Todos"
        class="w-48"
        :opciones="[
          { valor: 'entrada', texto: 'Entrada' },
          { valor: 'salida', texto: 'Salida' },
          { valor: 'inicio_descanso', texto: 'Inicio de descanso' },
          { valor: 'fin_descanso', texto: 'Fin de descanso' },
        ]"
        @update:model-value="recargar"
      />
    </div>

    <BaseAlerta v-if="!sedeSeleccionada" tipo="info" class="mt-6">Selecciona una sede para ver sus marcaciones.</BaseAlerta>

    <template v-else>
      <BaseAlerta v-if="marcacionesStore.error" tipo="error" class="mt-6">{{ marcacionesStore.error }}</BaseAlerta>

      <p v-if="marcacionesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando marcaciones…</p>

      <div
        v-else-if="marcacionesStore.marcaciones.length === 0"
        class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhClockCountdown class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">No hay marcaciones con estos filtros.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="marcacion in marcacionesStore.marcaciones" :key="marcacion._id" class="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <div class="flex items-center gap-2.5">
              <p class="text-sm font-medium text-texto">{{ nombreEmpleado(marcacion.empleadoId) }}</p>
              <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_TIPO_MARCACION[marcacion.tipo] }}</span>
              <span v-if="!marcacion.geocercaValidada" class="inline-flex items-center gap-1 rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">
                <PhMapPinLine class="size-3" />
                Fuera de geocerca
              </span>
            </div>
            <p class="mt-0.5 text-xs text-texto-sutil">{{ formatoFechaHora(marcacion.timestamp) }} · canal {{ marcacion.canal }}</p>
          </div>
        </li>
      </ul>

      <BasePaginacion
        v-if="marcacionesStore.paginacion"
        :paginacion="marcacionesStore.paginacion"
        :limite="marcacionesStore.limite"
        @anterior="marcacionesStore.irAPaginaAnterior"
        @siguiente="marcacionesStore.irAPaginaSiguiente"
        @cambiar-limite="marcacionesStore.cambiarLimite"
      />
    </template>
  </div>
</template>
