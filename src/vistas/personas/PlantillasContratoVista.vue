<script setup>
import { onMounted, reactive, ref } from "vue";
import { PhDownloadSimple, PhMagicWand, PhPencilSimple, PhPlus, PhProhibit, PhSignature, PhCompass } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseEditorEnriquecido from "@/componentes/base/BaseEditorEnriquecido.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { usePlantillaContratoStore } from "@/stores/plantillaContrato.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_VINCULO, ETIQUETAS_TIPO_VINCULO } from "@/utils/contrato.util";

const plantillasStore = usePlantillaContratoStore();
const { puede } = usePermisos();

onMounted(() => {
  plantillasStore.cargarPaginaPlantillas();
  plantillasStore.cargarVariables();
});

const modalAbierto = ref(false);
const plantillaEditando = ref(null);
const confirmandoId = ref(null);
const modalGuiaAbierto = ref(false);

const formulario = reactive({ nombre: "", tipoVinculo: "", cuerpo: "" });

function abrirCrear() {
  plantillaEditando.value = null;
  Object.assign(formulario, { nombre: "", tipoVinculo: "", cuerpo: "" });
  modalAbierto.value = true;
}

function abrirEditar(plantilla) {
  plantillaEditando.value = plantilla;
  Object.assign(formulario, { nombre: plantilla.nombre, tipoVinculo: plantilla.tipoVinculo || "", cuerpo: plantilla.cuerpo });
  modalAbierto.value = true;
}

function cuerpoEstaVacio(html) {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

async function manejarEnvio() {
  if (cuerpoEstaVacio(formulario.cuerpo)) {
    plantillasStore.errorGuardado = "El cuerpo del contrato no puede estar vacío.";
    return;
  }
  const datos = {
    nombre: formulario.nombre,
    cuerpo: formulario.cuerpo,
    ...(formulario.tipoVinculo ? { tipoVinculo: formulario.tipoVinculo } : {}),
  };
  const exito = plantillaEditando.value
    ? await plantillasStore.actualizarPlantilla(plantillaEditando.value._id, datos)
    : await plantillasStore.crearPlantilla(datos);
  if (exito) modalAbierto.value = false;
}

function etiquetaVariable(variable) {
  return `{{${variable.variable}}}`;
}

function manejarAnular(plantilla) {
  if (confirmandoId.value !== plantilla._id) {
    confirmandoId.value = plantilla._id;
    setTimeout(() => {
      if (confirmandoId.value === plantilla._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  plantillasStore.anularPlantilla(plantilla._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
          Plantillas de contrato
          <AyudaInfo
            texto="El texto que se convierte en PDF al solicitar la firma de un contrato. Usa variables como {{empleado_nombres}} o {{contrato_salario}} — se reemplazan automáticamente con los datos de cada empleado y contrato."
          />
        </h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Define el texto base que se envía a firmar. Las variables se reemplazan por los datos reales de cada empleado.</p>
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <BaseBoton ancho="auto" variante="secundario" @click="modalGuiaAbierto = true">
          <PhCompass class="size-4" weight="bold" />
          Guía: crear una desde cero
        </BaseBoton>
        <BaseBoton
          v-if="puede(MODULOS.PLANTILLA_CONTRATO, ACCIONES.CREAR)"
          ancho="auto"
          variante="secundario"
          :cargando="plantillasStore.creandoEjemplos"
          @click="plantillasStore.crearEjemplos"
        >
          <PhMagicWand class="size-4" weight="bold" />
          Crear plantillas de ejemplo
        </BaseBoton>
        <BaseBoton v-if="puede(MODULOS.PLANTILLA_CONTRATO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
          <PhPlus class="size-4" weight="bold" />
          Nueva plantilla
        </BaseBoton>
      </div>
    </div>

    <BaseAlerta v-if="plantillasStore.errorEjemplos" tipo="error" class="mt-4">{{ plantillasStore.errorEjemplos }}</BaseAlerta>

    <div v-if="plantillasStore.variables.length > 0" class="mt-6 rounded-2xl border border-borde bg-fondo-elevado p-5">
      <h2 class="text-sm font-semibold text-texto">Variables disponibles</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="variable in plantillasStore.variables"
          :key="variable.variable"
          :title="variable.descripcion"
          class="rounded-full bg-acento/10 px-2.5 py-1 text-xs font-medium text-acento"
        >
          {{ etiquetaVariable(variable) }}
        </span>
      </div>
    </div>

    <BaseAlerta v-if="plantillasStore.error" tipo="error" class="mt-6">{{ plantillasStore.error }}</BaseAlerta>
    <BaseAlerta v-if="plantillasStore.errorAccion" tipo="error" class="mt-6">{{ plantillasStore.errorAccion }}</BaseAlerta>
    <BaseAlerta v-if="plantillasStore.errorDescargar" tipo="error" class="mt-6">{{ plantillasStore.errorDescargar }}</BaseAlerta>

    <p v-if="plantillasStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando plantillas…</p>

    <div
      v-else-if="plantillasStore.plantillasPagina.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhSignature class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no has creado ninguna plantilla de contrato.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="plantilla in plantillasStore.plantillasPagina" :key="plantilla._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ plantilla.nombre }}</p>
            <span v-if="plantilla.tipoVinculo" class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">
              {{ ETIQUETAS_TIPO_VINCULO[plantilla.tipoVinculo] }}
            </span>
            <span class="text-xs text-texto-sutil">v{{ plantilla.version }}</span>
            <span v-if="!plantilla.activa" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactiva</span>
          </div>
          <p class="mt-1 truncate text-xs text-texto-sutil">{{ plantilla.cuerpo }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto disabled:opacity-50"
            aria-label="Descargar vista previa en PDF"
            title="Descargar vista previa en PDF"
            :disabled="plantillasStore.descargandoId === plantilla._id"
            @click="plantillasStore.descargarPdf(plantilla)"
          >
            <PhDownloadSimple class="size-4" />
          </button>
          <button
            v-if="puede(MODULOS.PLANTILLA_CONTRATO, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            title="Editar"
            @click="abrirEditar(plantilla)"
          >
            <PhPencilSimple class="size-4" />
          </button>
          <button
            v-if="plantilla.activa && puede(MODULOS.PLANTILLA_CONTRATO, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === plantilla._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(plantilla)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === plantilla._id ? "¿Confirmar?" : "Desactivar" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="plantillasStore.paginacionPlantillas"
      :paginacion="plantillasStore.paginacionPlantillas"
      :limite="plantillasStore.limite"
      @anterior="plantillasStore.irAPaginaAnteriorPlantillas"
      @siguiente="plantillasStore.irAPaginaSiguientePlantillas"
      @cambiar-limite="plantillasStore.cambiarLimitePlantillas"
    />

    <BaseModal v-model="modalAbierto" :titulo="plantillaEditando ? 'Editar plantilla' : 'Nueva plantilla'" ancho="xl">
      <BaseAlerta v-if="plantillasStore.errorGuardado" tipo="error" class="mb-5">{{ plantillasStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Contrato a término indefinido" requerido />
        <BaseSelect v-model="formulario.tipoVinculo" label="Tipo de vínculo sugerido (opcional)" :opciones="OPCIONES_TIPO_VINCULO" />
        <BaseEditorEnriquecido v-model="formulario.cuerpo" label="Cuerpo del contrato" :variables="plantillasStore.variables" />
        <BaseBoton tipo="submit" :cargando="plantillasStore.guardando" class="mt-2">{{ plantillaEditando ? "Guardar cambios" : "Crear plantilla" }}</BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalGuiaAbierto" titulo="Guía: crear una plantilla desde cero">
      <ol class="flex flex-col gap-4 text-sm text-texto">
        <li class="flex gap-3">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento/10 text-xs font-semibold text-acento">1</span>
          <p>Dale un nombre que te permita identificarla rápido en el listado, por ejemplo "Contrato de ventas — término fijo".</p>
        </li>
        <li class="flex gap-3">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento/10 text-xs font-semibold text-acento">2</span>
          <p>(Opcional) Elige el tipo de vínculo sugerido — es solo para ayudarte a encontrarla, no limita en qué contratos la puedes usar.</p>
        </li>
        <li class="flex gap-3">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento/10 text-xs font-semibold text-acento">3</span>
          <p>Escribe el cuerpo igual que en un procesador de texto: títulos, negrita, listas. Usa la barra de herramientas del editor para darle formato.</p>
        </li>
        <li class="flex gap-3">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento/10 text-xs font-semibold text-acento">4</span>
          <p>
            Donde necesites un dato real (nombre del empleado, salario, fecha de inicio...), <strong>nunca lo escribas a mano</strong> — usa el selector
            "+ Variable" de la barra de herramientas. Se reemplaza automáticamente por el dato real de cada empleado y contrato al generar el PDF.
          </p>
        </li>
        <li class="flex gap-3">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento/10 text-xs font-semibold text-acento">5</span>
          <p>Guarda, y usa el botón "Descargar vista previa en PDF" en el listado para ver cómo queda impresa antes de usarla con un empleado real.</p>
        </li>
      </ol>
      <div class="mt-5 rounded-xl border border-borde bg-fondo p-4">
        <p class="flex items-start gap-2 text-sm text-texto">
          <PhMagicWand class="mt-0.5 size-4 shrink-0 text-acento" />
          <span
            ><strong>Atajo:</strong> en vez de empezar de una página en blanco, usa "Crear plantillas de ejemplo" (botón arriba) — crea 5 plantillas ya
            redactadas (una por cada tipo de vínculo, más un otrosí/modificación de contrato) que puedes editar o eliminar libremente.</span
          >
        </p>
      </div>
    </BaseModal>
  </div>
</template>
