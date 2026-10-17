<script setup>
import { onMounted, reactive } from "vue";
import { PhPackage } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useOperadorPlanesStore } from "@/stores/operadorPlanes.store";
import { formatoMoneda } from "@/utils/formato.util";

const planesStore = useOperadorPlanesStore();

onMounted(() => {
  planesStore.cargarPaginaPlanes();
});

const formularioPlan = reactive({ nombre: "", precio: "", maxEmpleados: "", maxSedes: "", maxDispositivos: "" });

async function manejarCrearPlan() {
  const exito = await planesStore.crearPlan({
    nombre: formularioPlan.nombre,
    precio: Number(formularioPlan.precio),
    limitesBase: {
      maxEmpleados: Number(formularioPlan.maxEmpleados),
      maxSedes: Number(formularioPlan.maxSedes),
      maxDispositivos: Number(formularioPlan.maxDispositivos),
    },
  });
  if (exito) Object.assign(formularioPlan, { nombre: "", precio: "", maxEmpleados: "", maxSedes: "", maxDispositivos: "" });
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Planes de suscripción</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Planes disponibles y sus límites base por empresa.</p>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <section class="rounded-2xl border border-borde bg-fondo-elevado p-6">
        <div class="flex flex-wrap items-end gap-3">
          <BaseInput
            v-model="planesStore.filtros.nombre"
            label="Buscar"
            placeholder="Nombre del plan"
            class="w-56"
            @keyup.enter="planesStore.cargarPaginaPlanes"
          />
          <BaseBoton ancho="auto" variante="secundario" @click="planesStore.cargarPaginaPlanes">Buscar</BaseBoton>
        </div>

        <p v-if="planesStore.cargando" class="mt-5 text-sm text-texto-sutil">Cargando planes…</p>
        <BaseAlerta v-else-if="planesStore.error" tipo="error" class="mt-5">{{ planesStore.error }}</BaseAlerta>
        <div
          v-else-if="planesStore.planesPagina.length === 0"
          class="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
        >
          <PhPackage class="size-6 text-texto-sutil" />
          <p class="text-sm text-texto-sutil">Aún no hay planes. Crea el primero al lado.</p>
        </div>
        <ul v-else class="mt-5 flex flex-col divide-y divide-borde">
          <li v-for="plan in planesStore.planesPagina" :key="plan._id" class="flex items-center justify-between gap-4 py-3">
            <div>
              <p class="text-sm font-medium text-texto">{{ plan.nombre }}</p>
              <p class="text-xs text-texto-sutil">
                {{ plan.limitesBase.maxEmpleados }} empleados · {{ plan.limitesBase.maxSedes }} sedes ·
                {{ plan.limitesBase.maxDispositivos }} dispositivos
              </p>
            </div>
            <span class="text-sm font-semibold text-texto">{{ formatoMoneda(plan.precio) }}</span>
          </li>
        </ul>

        <BasePaginacion
          v-if="planesStore.paginacionPlanes"
          :paginacion="planesStore.paginacionPlanes"
          :limite="planesStore.limite"
          @anterior="planesStore.irAPaginaAnteriorPlanes"
          @siguiente="planesStore.irAPaginaSiguientePlanes"
          @cambiar-limite="planesStore.cambiarLimitePlanes"
        />
      </section>

      <section class="rounded-2xl border border-borde bg-fondo-elevado p-6">
        <h2 class="text-base font-semibold text-texto">Crear plan nuevo</h2>
        <form class="mt-5 flex flex-col gap-4" novalidate @submit.prevent="manejarCrearPlan">
          <BaseAlerta v-if="planesStore.errorCreacion" tipo="error">{{ planesStore.errorCreacion }}</BaseAlerta>
          <BaseInput v-model="formularioPlan.nombre" label="Nombre del plan" placeholder="Pyme" requerido />
          <BaseInput v-model="formularioPlan.precio" type="number" label="Precio mensual (COP)" placeholder="350000" requerido />
          <div class="grid grid-cols-3 gap-3">
            <BaseInput v-model="formularioPlan.maxEmpleados" type="number" label="Máx. empleados" placeholder="50" requerido />
            <BaseInput v-model="formularioPlan.maxSedes" type="number" label="Máx. sedes" placeholder="3" requerido />
            <BaseInput v-model="formularioPlan.maxDispositivos" type="number" label="Máx. dispositivos" placeholder="10" requerido />
          </div>
          <BaseBoton tipo="submit" variante="secundario" :cargando="planesStore.creando" class="mt-1">Crear plan</BaseBoton>
        </form>
      </section>
    </div>
  </div>
</template>
