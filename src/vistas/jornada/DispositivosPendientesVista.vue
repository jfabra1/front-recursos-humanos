<script setup>
import { onMounted, ref } from "vue";
import { PhDeviceMobile } from "@phosphor-icons/vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import { useDispositivosStore } from "@/stores/dispositivos.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const dispositivosStore = useDispositivosStore();
const empleadosStore = useEmpleadosStore();
const { puede } = usePermisos();

const procesandoId = ref(null);

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  dispositivosStore.cargarPendientes();
});

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}

async function manejarAprobar(dispositivo) {
  procesandoId.value = dispositivo._id;
  await dispositivosStore.aprobarCambio(dispositivo._id);
  procesandoId.value = null;
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Dispositivos pendientes</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Cambios de dispositivo que esperan aprobación — al aprobar, se revoca el anterior.</p>

    <BaseAlerta v-if="dispositivosStore.errorPendientes" tipo="error" class="mt-6">{{ dispositivosStore.errorPendientes }}</BaseAlerta>
    <BaseAlerta v-if="dispositivosStore.errorAccion" tipo="error" class="mt-6">{{ dispositivosStore.errorAccion }}</BaseAlerta>

    <p v-if="dispositivosStore.cargandoPendientes" class="mt-8 text-sm text-texto-sutil">Cargando…</p>

    <div
      v-else-if="dispositivosStore.pendientes.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhDeviceMobile class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay cambios de dispositivo pendientes.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="dispositivo in dispositivosStore.pendientes" :key="dispositivo._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p class="text-sm font-medium text-texto">{{ nombreEmpleado(dispositivo.empleadoId) }}</p>
          <p class="mt-0.5 text-xs text-texto-sutil">{{ dispositivo.modelo || dispositivo.identificadorDispositivo }} · canal {{ dispositivo.canal }}</p>
        </div>
        <BaseBoton
          v-if="puede(MODULOS.DISPOSITIVO, ACCIONES.EDITAR)"
          ancho="auto"
          :cargando="procesandoId === dispositivo._id"
          @click="manejarAprobar(dispositivo)"
        >
          Aprobar cambio
        </BaseBoton>
      </li>
    </ul>
  </div>
</template>
