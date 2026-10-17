<script setup>
import { onMounted, reactive, ref } from "vue";
import { PhPlus, PhProhibit, PhScales } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseTextarea from "@/componentes/base/BaseTextarea.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useInstrumentosColectivosStore } from "@/stores/instrumentosColectivos.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_INSTRUMENTO, ETIQUETAS_TIPO_INSTRUMENTO } from "@/utils/instrumentoColectivo.util";
import { formatoFecha } from "@/utils/formato.util";

const instrumentosStore = useInstrumentosColectivosStore();
const { puede } = usePermisos();

onMounted(() => {
  instrumentosStore.cargarPaginaInstrumentos();
});

const modalAbierto = ref(false);
const confirmandoId = ref(null);

const formulario = reactive({
  nombre: "",
  tipo: "convencion_colectiva",
  vigenteDesde: "",
  vigenteHasta: "",
  condicionesDestacadas: "",
});

function abrirCrear() {
  Object.assign(formulario, { nombre: "", tipo: "convencion_colectiva", vigenteDesde: "", vigenteHasta: "", condicionesDestacadas: "" });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  const datos = {
    nombre: formulario.nombre,
    tipo: formulario.tipo,
    vigenteDesde: formulario.vigenteDesde,
    ...(formulario.vigenteHasta ? { vigenteHasta: formulario.vigenteHasta } : {}),
    ...(formulario.condicionesDestacadas ? { condicionesDestacadas: formulario.condicionesDestacadas } : {}),
  };
  if (await instrumentosStore.crearInstrumento(datos)) modalAbierto.value = false;
}

function manejarAnular(instrumento) {
  if (confirmandoId.value !== instrumento._id) {
    confirmandoId.value = instrumento._id;
    setTimeout(() => {
      if (confirmandoId.value === instrumento._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  instrumentosStore.anularInstrumento(instrumento._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
          Convenciones colectivas
          <AyudaInfo
            texto="Acuerdos que fijan condiciones laborales adicionales a las de la ley (beneficios, primas, permisos). Una convención colectiva se negocia con el sindicato; un pacto colectivo, directamente con los trabajadores no sindicalizados; un laudo arbitral es la decisión de un tribunal cuando esa negociación no llega a un acuerdo."
          />
        </h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Registro de convenciones, pactos y laudos arbitrales vigentes.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.INSTRUMENTO_COLECTIVO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nuevo registro
      </BaseBoton>
    </div>

    <BaseAlerta tipo="info" class="mt-6">
      Solo de registro: el sistema no automatiza la liquidación de condiciones pactadas aquí.
    </BaseAlerta>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput
        v-model="instrumentosStore.filtros.nombre"
        label="Buscar"
        placeholder="Nombre del instrumento"
        class="w-64"
        @keyup.enter="instrumentosStore.cargarPaginaInstrumentos"
      />
      <BaseBoton ancho="auto" variante="secundario" @click="instrumentosStore.cargarPaginaInstrumentos">Buscar</BaseBoton>
    </div>

    <BaseAlerta v-if="instrumentosStore.error" tipo="error" class="mt-6">{{ instrumentosStore.error }}</BaseAlerta>
    <BaseAlerta v-if="instrumentosStore.errorAccion" tipo="error" class="mt-6">{{ instrumentosStore.errorAccion }}</BaseAlerta>

    <p v-if="instrumentosStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando registros…</p>

    <div v-else-if="instrumentosStore.instrumentosPagina.length === 0" class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center">
      <PhScales class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no has registrado ninguna convención o pacto.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="instrumento in instrumentosStore.instrumentosPagina" :key="instrumento._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ instrumento.nombre }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_TIPO_INSTRUMENTO[instrumento.tipo] }}</span>
            <span v-if="!instrumento.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactivo</span>
          </div>
          <p class="mt-0.5 text-xs text-texto-sutil">
            Vigente desde {{ formatoFecha(instrumento.vigenteDesde) }}
            {{ instrumento.vigenteHasta ? `hasta ${formatoFecha(instrumento.vigenteHasta)}` : "(sin fecha de fin)" }}
          </p>
          <p v-if="instrumento.condicionesDestacadas" class="mt-1 truncate text-xs text-texto-sutil">{{ instrumento.condicionesDestacadas }}</p>
        </div>
        <button
          v-if="instrumento.activo && puede(MODULOS.INSTRUMENTO_COLECTIVO, ACCIONES.ELIMINAR)"
          type="button"
          class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          :class="confirmandoId === instrumento._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
          @click="manejarAnular(instrumento)"
        >
          <span class="inline-flex items-center gap-1.5">
            <PhProhibit class="size-[14px]" />
            {{ confirmandoId === instrumento._id ? "¿Confirmar?" : "Desactivar" }}
          </span>
        </button>
      </li>
    </ul>

    <BasePaginacion
      v-if="instrumentosStore.paginacionInstrumentos"
      :paginacion="instrumentosStore.paginacionInstrumentos"
      :limite="instrumentosStore.limite"
      @anterior="instrumentosStore.irAPaginaAnteriorInstrumentos"
      @siguiente="instrumentosStore.irAPaginaSiguienteInstrumentos"
      @cambiar-limite="instrumentosStore.cambiarLimiteInstrumentos"
    />

    <BaseModal v-model="modalAbierto" titulo="Nuevo registro">
      <BaseAlerta v-if="instrumentosStore.errorGuardado" tipo="error" class="mb-5">{{ instrumentosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Convención colectiva 2026-2028" requerido />
        <BaseSelect v-model="formulario.tipo" label="Tipo" :opciones="OPCIONES_TIPO_INSTRUMENTO" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.vigenteDesde" type="date" label="Vigente desde" requerido />
          <BaseInput v-model="formulario.vigenteHasta" type="date" label="Vigente hasta (opcional)" />
        </div>
        <BaseTextarea
          v-model="formulario.condicionesDestacadas"
          label="Condiciones destacadas (opcional)"
          placeholder="Resumen de los puntos más relevantes acordados…"
          :max-longitud="2000"
        />
        <BaseBoton tipo="submit" :cargando="instrumentosStore.guardando" class="mt-2">Registrar</BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
