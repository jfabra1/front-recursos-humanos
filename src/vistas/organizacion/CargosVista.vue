<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhBriefcase, PhPencilSimple, PhPlus, PhProhibit } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useCargosStore } from "@/stores/cargos.store";
import { useAreasStore } from "@/stores/areas.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const cargosStore = useCargosStore();
const areasStore = useAreasStore();
const { puede } = usePermisos();

onMounted(() => {
  cargosStore.cargarPaginaCargos();
  if (areasStore.areas.length === 0) areasStore.cargarAreas();
});

const modalAbierto = ref(false);
const cargoEditando = ref(null);
const confirmandoId = ref(null);

const formulario = reactive({ nombre: "", areaId: "" });

const opcionesAreas = computed(() => areasStore.areas.map((area) => ({ valor: area._id, texto: area.nombre })));

function nombreArea(areaId) {
  return areasStore.areas.find((area) => area._id === areaId)?.nombre || "—";
}

function abrirCrear() {
  cargoEditando.value = null;
  Object.assign(formulario, { nombre: "", areaId: "" });
  modalAbierto.value = true;
}

function abrirEditar(cargo) {
  cargoEditando.value = cargo;
  Object.assign(formulario, { nombre: cargo.nombre, areaId: cargo.areaId });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  const datos = { nombre: formulario.nombre, areaId: formulario.areaId };

  const exito = cargoEditando.value
    ? await cargosStore.actualizarCargo(cargoEditando.value._id, datos)
    : await cargosStore.crearCargo(datos);

  if (exito) modalAbierto.value = false;
}

function manejarAnular(cargo) {
  if (confirmandoId.value !== cargo._id) {
    confirmandoId.value = cargo._id;
    setTimeout(() => {
      if (confirmandoId.value === cargo._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  cargosStore.anularCargo(cargo._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Cargos</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Cargos disponibles dentro de cada área.</p>
      </div>
      <BaseBoton
        v-if="puede(MODULOS.CARGO, ACCIONES.CREAR)"
        ancho="auto"
        :deshabilitado="areasStore.areas.length === 0"
        @click="abrirCrear"
      >
        <PhPlus class="size-4" weight="bold" />
        Nuevo cargo
      </BaseBoton>
    </div>

    <BaseAlerta v-if="areasStore.areas.length === 0 && !areasStore.cargando" tipo="info" class="mt-6">
      Crea al menos un área antes de registrar cargos.
    </BaseAlerta>
    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput
        v-model="cargosStore.filtros.nombre"
        label="Buscar"
        placeholder="Nombre del cargo"
        class="w-64"
        @keyup.enter="cargosStore.cargarPaginaCargos"
      />
      <BaseBoton ancho="auto" variante="secundario" @click="cargosStore.cargarPaginaCargos">Buscar</BaseBoton>
    </div>

    <BaseAlerta v-if="cargosStore.error" tipo="error" class="mt-6">{{ cargosStore.error }}</BaseAlerta>
    <BaseAlerta v-if="cargosStore.errorAccion" tipo="error" class="mt-6">{{ cargosStore.errorAccion }}</BaseAlerta>

    <p v-if="cargosStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando cargos…</p>

    <div v-else-if="cargosStore.cargosPagina.length === 0" class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center">
      <PhBriefcase class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no has registrado ningún cargo.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="cargo in cargosStore.cargosPagina" :key="cargo._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ cargo.nombre }}</p>
            <span v-if="!cargo.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactivo</span>
          </div>
          <p class="mt-0.5 text-xs text-texto-sutil">{{ nombreArea(cargo.areaId) }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="puede(MODULOS.CARGO, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            title="Editar"
            @click="abrirEditar(cargo)"
          >
            <PhPencilSimple class="size-[18px]" />
          </button>
          <button
            v-if="cargo.activo && puede(MODULOS.CARGO, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === cargo._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(cargo)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === cargo._id ? "¿Confirmar?" : "Desactivar" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="cargosStore.paginacionCargos"
      :paginacion="cargosStore.paginacionCargos"
      :limite="cargosStore.limite"
      @anterior="cargosStore.irAPaginaAnteriorCargos"
      @siguiente="cargosStore.irAPaginaSiguienteCargos"
      @cambiar-limite="cargosStore.cambiarLimiteCargos"
    />

    <BaseModal v-model="modalAbierto" :titulo="cargoEditando ? 'Editar cargo' : 'Nuevo cargo'">
      <BaseAlerta v-if="cargosStore.errorGuardado" tipo="error" class="mb-5">{{ cargosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Analista de nómina" requerido />
        <BaseSelect v-model="formulario.areaId" label="Área" :opciones="opcionesAreas" requerido />
        <BaseBoton tipo="submit" :cargando="cargosStore.guardando" class="mt-2">
          {{ cargoEditando ? "Guardar cambios" : "Crear cargo" }}
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
