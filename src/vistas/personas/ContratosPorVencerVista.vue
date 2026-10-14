<script setup>
import { computed, onMounted, ref } from "vue";
import { PhCalendarX } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import { useContratosStore } from "@/stores/contratos.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { ETIQUETAS_TIPO_VINCULO } from "@/utils/contrato.util";
import { formatoFecha, formatoMoneda } from "@/utils/formato.util";

const contratosStore = useContratosStore();
const empleadosStore = useEmpleadosStore();

const dias = ref("30");

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  contratosStore.cargarPorVencer(Number(dias.value));
});

function actualizar() {
  contratosStore.cargarPorVencer(Number(dias.value) || 30);
}

// `por-vencer` solo trae el empleado parcialmente poblado (sin nombre): se cruza con
// la lista ya cargada de empleados para mostrar a quién pertenece cada contrato.
function nombreEmpleado(contrato) {
  const empleado = empleadosStore.empleados.find((item) => item._id === contrato.empleadoId._id);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "Empleado dado de baja o no encontrado";
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Contratos por vencer</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Contratos vigentes con fecha de fin próxima, para gestionar su renovación a tiempo.</p>

    <div class="mt-6 flex items-end gap-3">
      <div class="w-40">
        <BaseInput v-model="dias" type="number" label="Días de anticipación" />
      </div>
      <BaseBoton ancho="auto" @click="actualizar">Actualizar</BaseBoton>
    </div>

    <BaseAlerta v-if="contratosStore.errorPorVencer" tipo="error" class="mt-6">{{ contratosStore.errorPorVencer }}</BaseAlerta>

    <p v-if="contratosStore.cargandoPorVencer" class="mt-8 text-sm text-texto-sutil">Cargando…</p>

    <div
      v-else-if="contratosStore.porVencer.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhCalendarX class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Ningún contrato vence en los próximos {{ dias || 30 }} días.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="contrato in contratosStore.porVencer" :key="contrato._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p class="text-sm font-medium text-texto">{{ nombreEmpleado(contrato) }}</p>
          <p class="mt-0.5 text-xs text-texto-sutil">
            {{ ETIQUETAS_TIPO_VINCULO[contrato.tipoVinculo] }} · {{ formatoMoneda(contrato.salario) }}
          </p>
        </div>
        <span class="rounded-full bg-error-fondo px-2.5 py-1 text-xs font-medium text-error">
          Vence {{ formatoFecha(contrato.fechaFin) }}
        </span>
      </li>
    </ul>
  </div>
</template>
