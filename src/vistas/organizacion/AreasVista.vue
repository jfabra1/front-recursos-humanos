<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhPencilSimple, PhPlus, PhProhibit, PhSquaresFour } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useAreasStore } from "@/stores/areas.store";
import { useSedesStore } from "@/stores/sedes.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const areasStore = useAreasStore();
const sedesStore = useSedesStore();
const { puede } = usePermisos();

onMounted(() => {
  areasStore.cargarPaginaAreas();
  if (sedesStore.sedes.length === 0) sedesStore.cargarSedes();
  if (areasStore.areas.length === 0) areasStore.cargarAreas();
});

const modalAbierto = ref(false);
const areaEditando = ref(null);
const confirmandoId = ref(null);

const formulario = reactive({ nombre: "", sedeId: "", areaPadreId: "" });

const opcionesSedes = computed(() => sedesStore.sedes.map((sede) => ({ valor: sede._id, texto: sede.nombre })));
const opcionesAreasPadre = computed(() =>
  areasStore.areas.filter((area) => area._id !== areaEditando.value?._id).map((area) => ({ valor: area._id, texto: area.nombre })),
);

function nombreSede(sedeId) {
  return sedesStore.sedes.find((sede) => sede._id === sedeId)?.nombre;
}

function abrirCrear() {
  areaEditando.value = null;
  Object.assign(formulario, { nombre: "", sedeId: "", areaPadreId: "" });
  modalAbierto.value = true;
}

function abrirEditar(area) {
  areaEditando.value = area;
  Object.assign(formulario, { nombre: area.nombre, sedeId: area.sedeId || "", areaPadreId: area.areaPadreId || "" });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  const datos = {
    nombre: formulario.nombre,
    ...(formulario.sedeId ? { sedeId: formulario.sedeId } : {}),
    ...(formulario.areaPadreId ? { areaPadreId: formulario.areaPadreId } : {}),
  };

  const exito = areaEditando.value
    ? await areasStore.actualizarArea(areaEditando.value._id, datos)
    : await areasStore.crearArea(datos);

  if (exito) modalAbierto.value = false;
}

function manejarAnular(area) {
  if (confirmandoId.value !== area._id) {
    confirmandoId.value = area._id;
    setTimeout(() => {
      if (confirmandoId.value === area._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  areasStore.anularArea(area._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Áreas</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Estructura organizativa de la empresa.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.AREA, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nueva área
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput
        v-model="areasStore.filtros.nombre"
        label="Buscar"
        placeholder="Nombre del área"
        class="w-64"
        @keyup.enter="areasStore.cargarPaginaAreas"
      />
      <BaseBoton ancho="auto" variante="secundario" @click="areasStore.cargarPaginaAreas">Buscar</BaseBoton>
    </div>

    <BaseAlerta v-if="areasStore.error" tipo="error" class="mt-6">{{ areasStore.error }}</BaseAlerta>
    <BaseAlerta v-if="areasStore.errorAccion" tipo="error" class="mt-6">{{ areasStore.errorAccion }}</BaseAlerta>

    <p v-if="areasStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando áreas…</p>

    <div v-else-if="areasStore.areasPagina.length === 0" class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center">
      <PhSquaresFour class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no has registrado ninguna área.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="area in areasStore.areasPagina" :key="area._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ area.nombre }}</p>
            <span v-if="!area.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactiva</span>
          </div>
          <p class="mt-0.5 text-xs text-texto-sutil">{{ area.sedeId ? nombreSede(area.sedeId) : "Toda la empresa" }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="puede(MODULOS.AREA, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            @click="abrirEditar(area)"
          >
            <PhPencilSimple class="size-[18px]" />
          </button>
          <button
            v-if="area.activo && puede(MODULOS.AREA, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === area._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(area)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === area._id ? "¿Confirmar?" : "Desactivar" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="areasStore.paginacionAreas && areasStore.paginacionAreas.totalPaginas > 1"
      :paginacion="areasStore.paginacionAreas"
      @anterior="areasStore.irAPaginaAnteriorAreas"
      @siguiente="areasStore.irAPaginaSiguienteAreas"
    />

    <BaseModal v-model="modalAbierto" :titulo="areaEditando ? 'Editar área' : 'Nueva área'">
      <BaseAlerta v-if="areasStore.errorGuardado" tipo="error" class="mb-5">{{ areasStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Recursos Humanos" requerido />
        <BaseSelect v-model="formulario.sedeId" label="Sede" :opciones="opcionesSedes" placeholder="Toda la empresa (sin sede específica)" />
        <BaseSelect v-model="formulario.areaPadreId" label="Área superior" :opciones="opcionesAreasPadre" placeholder="Ninguna (área de primer nivel)" />
        <BaseBoton tipo="submit" :cargando="areasStore.guardando" class="mt-2">
          {{ areaEditando ? "Guardar cambios" : "Crear área" }}
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
