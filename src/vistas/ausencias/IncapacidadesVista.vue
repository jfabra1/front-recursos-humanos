<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { PhFirstAidKit, PhPlus } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useIncapacidadesStore } from "@/stores/incapacidades.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useDocumentosStore } from "@/stores/documentos.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import {
  OPCIONES_TIPO_ORIGEN_INCAPACIDAD,
  ETIQUETAS_TIPO_ORIGEN_INCAPACIDAD,
  OPCIONES_ESTADO_INCAPACIDAD,
  ETIQUETAS_ESTADO_INCAPACIDAD,
} from "@/utils/incapacidad.util";
import { formatoFecha } from "@/utils/formato.util";

const incapacidadesStore = useIncapacidadesStore();
const empleadosStore = useEmpleadosStore();
const documentosStore = useDocumentosStore();
const { puede } = usePermisos();

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  incapacidadesStore.cargarIncapacidades();
});

const opcionesEmpleados = computed(() =>
  empleadosStore.empleados.map((empleado) => ({ valor: empleado._id, texto: `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` })),
);

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}

async function manejarCambiarEstado(incapacidad, estado) {
  await incapacidadesStore.cambiarEstado(incapacidad._id, estado);
}

// Modal registrar
const modalRegistrarAbierto = ref(false);
const formulario = reactive({ empleadoId: "", tipoOrigen: "EPS", fechaInicio: "", fechaFin: "", diasTotales: "", documentoSoporteId: "" });
const formularioDocumentoNuevo = reactive({ archivoUrl: "" });
const agregandoDocumentoNuevo = ref(false);

function abrirRegistrar() {
  Object.assign(formulario, { empleadoId: "", tipoOrigen: "EPS", fechaInicio: "", fechaFin: "", diasTotales: "", documentoSoporteId: "" });
  Object.assign(formularioDocumentoNuevo, { archivoUrl: "" });
  agregandoDocumentoNuevo.value = false;
  modalRegistrarAbierto.value = true;
}

watch(
  () => formulario.empleadoId,
  (empleadoId) => {
    formulario.documentoSoporteId = "";
    agregandoDocumentoNuevo.value = false;
    if (empleadoId) documentosStore.cargarDocumentos(empleadoId);
  },
);

const opcionesDocumentos = computed(() =>
  documentosStore.documentos.map((documento) => ({ valor: documento._id, texto: `${documento.tipo} — ${documento.archivoUrl}` })),
);

async function manejarAgregarDocumento() {
  const datos = { empleadoId: formulario.empleadoId, tipo: "soporte_incapacidad", archivoUrl: formularioDocumentoNuevo.archivoUrl };
  if (await documentosStore.crearDocumento(datos)) {
    formulario.documentoSoporteId = documentosStore.documentos[0]._id;
    Object.assign(formularioDocumentoNuevo, { archivoUrl: "" });
    agregandoDocumentoNuevo.value = false;
  }
}

async function manejarRegistrar() {
  const datos = {
    empleadoId: formulario.empleadoId,
    tipoOrigen: formulario.tipoOrigen,
    fechaInicio: formulario.fechaInicio,
    fechaFin: formulario.fechaFin,
    diasTotales: Number(formulario.diasTotales),
    documentoSoporteId: formulario.documentoSoporteId,
  };
  if (await incapacidadesStore.crearIncapacidad(datos)) {
    modalRegistrarAbierto.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
          Incapacidades
          <AyudaInfo
            texto="Incapacidades médicas por EPS (enfermedad general) o ARL (origen laboral). Al registrarlas se ajusta automáticamente el saldo de vacaciones si se solapan con vacaciones ya aprobadas, y se concilian las ausencias de asistencia del mismo rango."
          />
        </h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Registro y seguimiento de incapacidades médicas.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.INCAPACIDAD, ACCIONES.CREAR)" ancho="auto" @click="abrirRegistrar">
        <PhPlus class="size-4" weight="bold" />
        Registrar incapacidad
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="incapacidadesStore.filtros.tipoOrigen"
        label="Origen"
        placeholder="Todos"
        class="w-48"
        :opciones="OPCIONES_TIPO_ORIGEN_INCAPACIDAD"
        @update:model-value="incapacidadesStore.cargarIncapacidades"
      />
      <BaseSelect
        v-model="incapacidadesStore.filtros.estado"
        label="Estado"
        placeholder="Todos"
        class="w-48"
        :opciones="OPCIONES_ESTADO_INCAPACIDAD"
        @update:model-value="incapacidadesStore.cargarIncapacidades"
      />
      <BaseSelect
        v-model="incapacidadesStore.filtros.empleadoId"
        label="Empleado"
        placeholder="Todos"
        class="w-56"
        :opciones="opcionesEmpleados"
        @update:model-value="incapacidadesStore.cargarIncapacidades"
      />
    </div>

    <BaseAlerta v-if="incapacidadesStore.error" tipo="error" class="mt-6">{{ incapacidadesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="incapacidadesStore.errorAccion" tipo="error" class="mt-6">{{ incapacidadesStore.errorAccion }}</BaseAlerta>

    <p v-if="incapacidadesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando incapacidades…</p>

    <div
      v-else-if="incapacidadesStore.incapacidades.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhFirstAidKit class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay incapacidades con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="incapacidad in incapacidadesStore.incapacidades" :key="incapacidad._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ nombreEmpleado(incapacidad.empleadoId) }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_TIPO_ORIGEN_INCAPACIDAD[incapacidad.tipoOrigen] }}</span>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_INCAPACIDAD[incapacidad.estado] }}</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            {{ formatoFecha(incapacidad.fechaInicio) }} – {{ formatoFecha(incapacidad.fechaFin) }} · {{ incapacidad.diasTotales }} días
          </p>
        </div>
        <BaseSelect
          v-if="puede(MODULOS.INCAPACIDAD, ACCIONES.EDITAR)"
          :model-value="incapacidad.estado"
          label="Estado"
          class="w-44 shrink-0"
          :opciones="OPCIONES_ESTADO_INCAPACIDAD"
          @update:model-value="(estado) => manejarCambiarEstado(incapacidad, estado)"
        />
      </li>
    </ul>

    <BasePaginacion
      v-if="incapacidadesStore.paginacion"
      :paginacion="incapacidadesStore.paginacion"
      :limite="incapacidadesStore.limite"
      @anterior="incapacidadesStore.irAPaginaAnterior"
      @siguiente="incapacidadesStore.irAPaginaSiguiente"
      @cambiar-limite="incapacidadesStore.cambiarLimite"
    />

    <BaseModal v-model="modalRegistrarAbierto" titulo="Registrar incapacidad">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarRegistrar">
        <BaseAlerta v-if="incapacidadesStore.errorGuardado" tipo="error">{{ incapacidadesStore.errorGuardado }}</BaseAlerta>
        <BaseSelect v-model="formulario.empleadoId" label="Empleado" :opciones="opcionesEmpleados" requerido />
        <BaseSelect v-model="formulario.tipoOrigen" label="Origen" :opciones="OPCIONES_TIPO_ORIGEN_INCAPACIDAD" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.fechaInicio" type="date" label="Fecha de inicio" requerido />
          <BaseInput v-model="formulario.fechaFin" type="date" label="Fecha de fin" requerido />
        </div>
        <BaseInput v-model="formulario.diasTotales" type="number" label="Días totales" requerido />

        <template v-if="formulario.empleadoId">
          <BaseSelect
            v-if="!agregandoDocumentoNuevo"
            v-model="formulario.documentoSoporteId"
            label="Documento de soporte"
            placeholder="Selecciona un documento"
            :opciones="opcionesDocumentos"
            requerido
          />
          <button
            v-if="!agregandoDocumentoNuevo"
            type="button"
            class="-mt-2 self-start text-xs font-medium text-acento hover:underline"
            @click="agregandoDocumentoNuevo = true"
          >
            + Agregar un documento nuevo
          </button>

          <div v-else class="flex flex-col gap-3 rounded-xl border border-borde bg-fondo p-4">
            <BaseInput v-model="formularioDocumentoNuevo.archivoUrl" type="url" label="Enlace del soporte médico" placeholder="https://..." requerido />
            <div class="flex gap-2">
              <BaseBoton tipo="button" ancho="auto" variante="secundario" :cargando="documentosStore.guardando" @click="manejarAgregarDocumento">
                Agregar documento
              </BaseBoton>
              <BaseBoton tipo="button" ancho="auto" variante="secundario" @click="agregandoDocumentoNuevo = false">Cancelar</BaseBoton>
            </div>
          </div>
        </template>

        <BaseBoton tipo="submit" :cargando="incapacidadesStore.guardando" :deshabilitado="!formulario.documentoSoporteId" class="mt-1">
          Registrar
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
