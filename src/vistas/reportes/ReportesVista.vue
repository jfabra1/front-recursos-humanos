<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhDownloadSimple, PhFileCsv } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import SelectorSede from "@/componentes/comunes/SelectorSede.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useReportesStore } from "@/stores/reportes.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { OPCIONES_TIPO_REPORTE, ETIQUETAS_TIPO_REPORTE, OPCIONES_FORMATO_REPORTE, TIPOS_SIN_RANGO_OBLIGATORIO, TIPOS_CON_FILTRO_SEDE } from "@/utils/reporte.util";
import { formatoFechaHora } from "@/utils/formato.util";

const reportesStore = useReportesStore();
const empleadosStore = useEmpleadosStore();
const usuariosStore = useUsuariosStore();

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  if (usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
  reportesStore.cargarExportaciones();
});

const opcionesEmpleados = computed(() =>
  empleadosStore.empleados.map((empleado) => ({ valor: empleado._id, texto: `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` })),
);
const opcionesUsuarios = computed(() => usuariosStore.usuarios.map((usuario) => ({ valor: usuario._id, texto: usuario.email })));

function nombreUsuario(usuarioId) {
  return usuariosStore.usuarios.find((usuario) => usuario._id === usuarioId)?.email || "—";
}

const formulario = reactive({ tipo: "", formato: "csv", desde: "", hasta: "", sedeId: "", empleadoId: "" });

const requiereRango = computed(() => formulario.tipo && !TIPOS_SIN_RANGO_OBLIGATORIO.includes(formulario.tipo));
const admiteSede = computed(() => TIPOS_CON_FILTRO_SEDE.includes(formulario.tipo));

async function manejarGenerar() {
  const filtros = {};
  if (formulario.desde) filtros.desde = formulario.desde;
  if (formulario.hasta) filtros.hasta = formulario.hasta;
  if (admiteSede.value && formulario.sedeId) filtros.sedeId = formulario.sedeId;
  if (formulario.empleadoId) filtros.empleadoId = formulario.empleadoId;

  await reportesStore.generarReporte({ tipo: formulario.tipo, formato: formulario.formato, filtros });
}
</script>

<template>
  <div>
    <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
      Reportes
      <AyudaInfo
        texto="Cada reporte generado queda guardado como una exportación, con quién la generó y cuándo — ese historial es en sí mismo el registro de auditoría de exportaciones que exige el MVP."
      />
    </h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Exporta datos agregados del sistema y descarga exportaciones ya generadas.</p>

    <section class="mt-8 rounded-2xl border border-borde bg-fondo-elevado p-6">
      <h2 class="text-sm font-semibold text-texto">Generar reporte</h2>
      <form class="mt-4 flex flex-col gap-4" novalidate @submit.prevent="manejarGenerar">
        <BaseAlerta v-if="reportesStore.errorGenerar" tipo="error">{{ reportesStore.errorGenerar }}</BaseAlerta>
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="formulario.tipo" label="Tipo de reporte" :opciones="OPCIONES_TIPO_REPORTE" requerido />
          <BaseSelect v-model="formulario.formato" label="Formato" :opciones="OPCIONES_FORMATO_REPORTE" requerido />
        </div>

        <div v-if="requiereRango" class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.desde" type="date" label="Desde" requerido />
          <BaseInput v-model="formulario.hasta" type="date" label="Hasta" requerido />
        </div>
        <BaseAlerta v-else-if="formulario.tipo" tipo="info">Este reporte es una foto del saldo vigente, no admite rango de fechas.</BaseAlerta>

        <div class="grid grid-cols-2 gap-3">
          <SelectorSede v-if="admiteSede" v-model="formulario.sedeId" />
          <BaseSelect v-model="formulario.empleadoId" label="Empleado" placeholder="Todos" :opciones="opcionesEmpleados" />
        </div>

        <BaseBoton tipo="submit" :cargando="reportesStore.generando" :deshabilitado="!formulario.tipo" ancho="auto" class="mt-1">
          <PhFileCsv class="size-4" weight="bold" />
          Generar
        </BaseBoton>
      </form>
    </section>

    <h2 class="mt-10 text-sm font-semibold text-texto">Historial de exportaciones</h2>
    <div class="mt-3 flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="reportesStore.filtros.tipo"
        label="Tipo"
        placeholder="Todos"
        class="w-56"
        :opciones="OPCIONES_TIPO_REPORTE"
        @update:model-value="reportesStore.cargarExportaciones"
      />
      <BaseSelect
        v-model="reportesStore.filtros.generadoPor"
        label="Generado por"
        placeholder="Todos"
        class="w-56"
        :opciones="opcionesUsuarios"
        @update:model-value="reportesStore.cargarExportaciones"
      />
    </div>

    <BaseAlerta v-if="reportesStore.error" tipo="error" class="mt-6">{{ reportesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="reportesStore.errorDescargar" tipo="error" class="mt-6">{{ reportesStore.errorDescargar }}</BaseAlerta>

    <p v-if="reportesStore.cargando" class="mt-6 text-sm text-texto-sutil">Cargando exportaciones…</p>

    <div
      v-else-if="reportesStore.exportaciones.length === 0"
      class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhFileCsv class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Todavía no se ha generado ningún reporte.</p>
    </div>

    <ul v-else class="mt-4 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="exportacion in reportesStore.exportaciones" :key="exportacion._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ ETIQUETAS_TIPO_REPORTE[exportacion.tipo] }}</p>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil uppercase">{{ exportacion.formato }}</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            {{ nombreUsuario(exportacion.generadoPor) }} · {{ formatoFechaHora(exportacion.createdAt) }}
          </p>
        </div>
        <button
          type="button"
          :disabled="reportesStore.descargandoId === exportacion._id"
          class="shrink-0 rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto disabled:opacity-50"
          aria-label="Descargar"
          @click="reportesStore.descargarExportacion(exportacion)"
        >
          <PhDownloadSimple class="size-5" />
        </button>
      </li>
    </ul>

    <BasePaginacion
      v-if="reportesStore.paginacion && reportesStore.paginacion.totalPaginas > 1"
      :paginacion="reportesStore.paginacion"
      @anterior="reportesStore.irAPaginaAnterior"
      @siguiente="reportesStore.irAPaginaSiguiente"
    />
  </div>
</template>
