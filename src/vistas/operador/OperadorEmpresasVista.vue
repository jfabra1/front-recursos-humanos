<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhBuildings, PhPlus } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useOperadorPlanesStore } from "@/stores/operadorPlanes.store";
import { useOperadorEmpresasStore } from "@/stores/operadorEmpresas.store";
import { formatoFecha, formatoMoneda } from "@/utils/formato.util";

const planesStore = useOperadorPlanesStore();
const empresasStore = useOperadorEmpresasStore();

const OPCIONES_ESTADO = [
  { valor: "activa", texto: "Activa" },
  { valor: "suspendida", texto: "Suspendida" },
];

onMounted(() => {
  if (planesStore.planes.length === 0) planesStore.cargarPlanes();
  empresasStore.cargarEmpresas();
});

const opcionesPlanes = computed(() =>
  planesStore.planes.map((plan) => ({ valor: plan._id, texto: `${plan.nombre} — ${formatoMoneda(plan.precio)}/mes` })),
);

function nombrePlan(empresa) {
  return empresa.planId?.nombre || "—";
}

const confirmandoId = ref(null);
const procesandoId = ref(null);

async function manejarSuspender(empresa) {
  if (confirmandoId.value !== empresa._id) {
    confirmandoId.value = empresa._id;
    setTimeout(() => {
      if (confirmandoId.value === empresa._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  procesandoId.value = empresa._id;
  await empresasStore.suspenderEmpresa(empresa._id);
  procesandoId.value = null;
}

async function manejarReactivar(empresa) {
  procesandoId.value = empresa._id;
  await empresasStore.reactivarEmpresa(empresa._id);
  procesandoId.value = null;
}

// Modal crear
const modalAbierto = ref(false);
const formularioEmpresa = reactive({ nombre: "", nit: "", planId: "", adminEmail: "", adminPassword: "" });

function abrirCrear() {
  Object.assign(formularioEmpresa, { nombre: "", nit: "", planId: "", adminEmail: "", adminPassword: "" });
  empresasStore.empresaCreada = null;
  modalAbierto.value = true;
}

async function manejarCrearEmpresa() {
  const exito = await empresasStore.crearEmpresa({ ...formularioEmpresa });
  if (exito) {
    Object.assign(formularioEmpresa, { nombre: "", nit: "", planId: "", adminEmail: "", adminPassword: "" });
    empresasStore.cargarEmpresas();
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Empresas clientes</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Alta de nuevas empresas y gestión de su estado.</p>
      </div>
      <BaseBoton ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nueva empresa
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput
        v-model="empresasStore.filtros.buscar"
        label="Buscar"
        placeholder="Nombre, NIT o slug"
        class="w-64"
        @keyup.enter="empresasStore.cargarEmpresas"
      />
      <BaseSelect
        v-model="empresasStore.filtros.estado"
        label="Estado"
        placeholder="Todos"
        class="w-44"
        :opciones="OPCIONES_ESTADO"
        @update:model-value="empresasStore.cargarEmpresas"
      />
      <BaseSelect
        v-model="empresasStore.filtros.planId"
        label="Plan"
        placeholder="Todos"
        class="w-56"
        :opciones="opcionesPlanes"
        @update:model-value="empresasStore.cargarEmpresas"
      />
      <BaseBoton ancho="auto" variante="secundario" @click="empresasStore.cargarEmpresas">Buscar</BaseBoton>
    </div>

    <BaseAlerta v-if="empresasStore.error" tipo="error" class="mt-6">{{ empresasStore.error }}</BaseAlerta>
    <BaseAlerta v-if="empresasStore.errorActualizacion" tipo="error" class="mt-6">{{ empresasStore.errorActualizacion }}</BaseAlerta>

    <p v-if="empresasStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando empresas…</p>

    <div
      v-else-if="empresasStore.empresas.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhBuildings class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay empresas con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="empresa in empresasStore.empresas" :key="empresa._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ empresa.nombre }}</p>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="empresa.estado === 'activa' ? 'bg-exito/10 text-exito' : 'bg-error-fondo text-error'"
            >
              {{ empresa.estado === "activa" ? "Activa" : "Suspendida" }}
            </span>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ nombrePlan(empresa) }}</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            NIT {{ empresa.nit }} · {{ empresa.slug }} · {{ empresa.limites.maxEmpleados }} empleados · {{ empresa.limites.maxSedes }} sedes ·
            desde {{ formatoFecha(empresa.createdAt) }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <BaseBoton
            v-if="empresa.estado === 'activa'"
            ancho="auto"
            variante="peligro"
            :cargando="procesandoId === empresa._id"
            @click="manejarSuspender(empresa)"
          >
            {{ confirmandoId === empresa._id ? "¿Confirmar?" : "Suspender" }}
          </BaseBoton>
          <BaseBoton v-else ancho="auto" variante="secundario" :cargando="procesandoId === empresa._id" @click="manejarReactivar(empresa)">
            Reactivar
          </BaseBoton>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="empresasStore.paginacion"
      :paginacion="empresasStore.paginacion"
      :limite="empresasStore.limite"
      @anterior="empresasStore.irAPaginaAnterior"
      @siguiente="empresasStore.irAPaginaSiguiente"
      @cambiar-limite="empresasStore.cambiarLimite"
    />

    <BaseModal v-model="modalAbierto" titulo="Nueva empresa">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarCrearEmpresa">
        <BaseAlerta v-if="empresasStore.errorCreacion" tipo="error">{{ empresasStore.errorCreacion }}</BaseAlerta>
        <BaseAlerta v-if="empresasStore.empresaCreada" tipo="exito">
          {{ empresasStore.empresaCreada.empresa.nombre }} creada (slug: {{ empresasStore.empresaCreada.empresa.slug }}).
          Administrador: {{ empresasStore.empresaCreada.administrador.email }}
        </BaseAlerta>

        <BaseInput v-model="formularioEmpresa.nombre" label="Nombre de la empresa" placeholder="Textiles del Valle S.A.S" requerido />
        <BaseInput v-model="formularioEmpresa.nit" label="NIT" placeholder="900123456-7" requerido />
        <BaseSelect
          v-model="formularioEmpresa.planId"
          label="Plan"
          :opciones="opcionesPlanes"
          :placeholder="planesStore.planes.length ? 'Selecciona un plan' : 'Crea un plan primero'"
          requerido
        />
        <BaseInput
          v-model="formularioEmpresa.adminEmail"
          type="email"
          label="Correo del administrador"
          placeholder="admin@empresa.com"
          autocomplete="off"
          requerido
        />
        <BaseInput
          v-model="formularioEmpresa.adminPassword"
          type="password"
          label="Contraseña inicial del administrador"
          placeholder="Mínimo 8 caracteres"
          autocomplete="new-password"
          requerido
        />
        <BaseBoton tipo="submit" :cargando="empresasStore.creando" class="mt-1">Crear empresa</BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
