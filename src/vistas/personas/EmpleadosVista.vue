<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  PhArrowCounterClockwise,
  PhArrowsClockwise,
  PhDeviceMobile,
  PhHandshake,
  PhLink,
  PhMagnifyingGlass,
  PhPaperclip,
  PhPencilSimple,
  PhProhibit,
  PhTrash,
  PhUserPlus,
  PhUsers,
} from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useSedesStore } from "@/stores/sedes.store";
import { useCargosStore } from "@/stores/cargos.store";
import { useDocumentosStore } from "@/stores/documentos.store";
import { useContratosStore } from "@/stores/contratos.store";
import { useDispositivosStore } from "@/stores/dispositivos.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_DOCUMENTO, OPCIONES_MODALIDAD, ETIQUETAS_ESTADO } from "@/utils/empleado.util";
import { OPCIONES_TIPO_VINCULO, ETIQUETAS_TIPO_VINCULO } from "@/utils/contrato.util";
import { ETIQUETAS_ESTADO_DISPOSITIVO } from "@/utils/jornada.util";
import { formatoFecha, formatoMoneda } from "@/utils/formato.util";

const empleadosStore = useEmpleadosStore();
const sedesStore = useSedesStore();
const cargosStore = useCargosStore();
const documentosStore = useDocumentosStore();
const dispositivosStore = useDispositivosStore();
const contratosStore = useContratosStore();
const { puede } = usePermisos();

onMounted(() => {
  empleadosStore.cargarPaginaEmpleados();
  if (sedesStore.sedes.length === 0) sedesStore.cargarSedes();
  if (cargosStore.cargos.length === 0) cargosStore.cargarCargos();
});

const opcionesSedes = computed(() => sedesStore.sedes.map((sede) => ({ valor: sede._id, texto: sede.nombre })));
const opcionesCargos = computed(() => cargosStore.cargos.map((cargo) => ({ valor: cargo._id, texto: cargo.nombre })));

// Búsqueda y filtro de estado
const terminoBusqueda = ref("");

function buscar() {
  empleadosStore.filtros.buscar = terminoBusqueda.value;
  empleadosStore.cargarPaginaEmpleados();
}

function alternarInactivos() {
  empleadosStore.filtros.activo = !empleadosStore.filtros.activo;
  empleadosStore.cargarPaginaEmpleados();
}

// Modal crear/editar
const modalAbierto = ref(false);
const empleadoEditando = ref(null);
const confirmandoId = ref(null);

const formulario = reactive({
  nombres: "",
  apellidos: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  sedeId: "",
  cargoId: "",
  fechaIngreso: "",
  perfilModalidad: "PRESENCIAL",
});

function abrirCrear() {
  empleadoEditando.value = null;
  Object.assign(formulario, {
    nombres: "",
    apellidos: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
    sedeId: "",
    cargoId: "",
    fechaIngreso: "",
    perfilModalidad: "PRESENCIAL",
  });
  modalAbierto.value = true;
}

function abrirEditar(empleado) {
  empleadoEditando.value = empleado;
  Object.assign(formulario, {
    sedeId: empleado.sedeId._id,
    cargoId: empleado.cargoId._id,
    perfilModalidad: empleado.perfilModalidad,
  });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  if (empleadoEditando.value) {
    const datos = { sedeId: formulario.sedeId, cargoId: formulario.cargoId, perfilModalidad: formulario.perfilModalidad };
    if (await empleadosStore.actualizarEmpleado(empleadoEditando.value._id, datos)) modalAbierto.value = false;
    return;
  }

  const datos = {
    datosPersona: {
      nombres: formulario.nombres,
      apellidos: formulario.apellidos,
      tipoDocumento: formulario.tipoDocumento,
      numeroDocumento: formulario.numeroDocumento,
      ...(formulario.fechaNacimiento ? { fechaNacimiento: formulario.fechaNacimiento } : {}),
      ...(formulario.telefono ? { telefono: formulario.telefono } : {}),
      ...(formulario.email ? { email: formulario.email } : {}),
    },
    sedeId: formulario.sedeId,
    cargoId: formulario.cargoId,
    fechaIngreso: formulario.fechaIngreso,
    perfilModalidad: formulario.perfilModalidad,
  };
  if (await empleadosStore.crearEmpleado(datos)) modalAbierto.value = false;
}

function manejarBaja(empleado) {
  if (confirmandoId.value !== empleado._id) {
    confirmandoId.value = empleado._id;
    setTimeout(() => {
      if (confirmandoId.value === empleado._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  empleadosStore.darDeBajaEmpleado(empleado._id);
}

// Modal recontratar
const modalRecontratarAbierto = ref(false);
const empleadoRecontratando = ref(null);
const formularioRecontratar = reactive({ sedeId: "", cargoId: "", fechaIngreso: "", perfilModalidad: "PRESENCIAL" });

function abrirRecontratar(empleado) {
  empleadoRecontratando.value = empleado;
  Object.assign(formularioRecontratar, {
    sedeId: empleado.sedeId._id,
    cargoId: empleado.cargoId._id,
    fechaIngreso: "",
    perfilModalidad: empleado.perfilModalidad,
  });
  modalRecontratarAbierto.value = true;
}

async function manejarRecontratar() {
  const exito = await empleadosStore.recontratarEmpleado(empleadoRecontratando.value._id, { ...formularioRecontratar });
  if (exito) modalRecontratarAbierto.value = false;
}

// Modal documentos
const modalDocumentosAbierto = ref(false);
const empleadoDocumentos = ref(null);
const confirmandoDocumentoId = ref(null);
const formularioDocumento = reactive({ tipo: "", archivoUrl: "", vigenciaHasta: "" });

function abrirDocumentos(empleado) {
  empleadoDocumentos.value = empleado;
  Object.assign(formularioDocumento, { tipo: "", archivoUrl: "", vigenciaHasta: "" });
  documentosStore.cargarDocumentos(empleado._id);
  modalDocumentosAbierto.value = true;
}

async function manejarCrearDocumento() {
  const datos = {
    empleadoId: empleadoDocumentos.value._id,
    tipo: formularioDocumento.tipo,
    archivoUrl: formularioDocumento.archivoUrl,
    ...(formularioDocumento.vigenciaHasta ? { vigenciaHasta: formularioDocumento.vigenciaHasta } : {}),
  };
  if (await documentosStore.crearDocumento(datos)) {
    Object.assign(formularioDocumento, { tipo: "", archivoUrl: "", vigenciaHasta: "" });
  }
}

function manejarAnularDocumento(documento) {
  if (confirmandoDocumentoId.value !== documento._id) {
    confirmandoDocumentoId.value = documento._id;
    setTimeout(() => {
      if (confirmandoDocumentoId.value === documento._id) confirmandoDocumentoId.value = null;
    }, 4000);
    return;
  }
  confirmandoDocumentoId.value = null;
  documentosStore.anularDocumento(documento._id);
}

// Modal contrato
const modalContratoAbierto = ref(false);
const empleadoContrato = ref(null);
const mostrandoFormularioContrato = ref(false);
const formularioContrato = reactive({ tipoVinculo: "indefinido", fechaInicio: "", fechaFin: "", salario: "" });

function abrirContrato(empleado) {
  empleadoContrato.value = empleado;
  mostrandoFormularioContrato.value = false;
  contratosStore.cargarHistorial(empleado._id);
  modalContratoAbierto.value = true;
}

function abrirFormularioContrato() {
  const vigente = contratosStore.contratoVigente;
  Object.assign(formularioContrato, {
    tipoVinculo: vigente?.tipoVinculo || "indefinido",
    fechaInicio: "",
    fechaFin: vigente?.fechaFin ? vigente.fechaFin.slice(0, 10) : "",
    salario: vigente ? String(vigente.salario) : "",
  });
  mostrandoFormularioContrato.value = true;
}

async function manejarGuardarContrato() {
  const datos = {
    tipoVinculo: formularioContrato.tipoVinculo,
    fechaInicio: formularioContrato.fechaInicio,
    ...(formularioContrato.fechaFin ? { fechaFin: formularioContrato.fechaFin } : {}),
    salario: Number(formularioContrato.salario),
  };

  const exito = contratosStore.contratoVigente
    ? await contratosStore.renovarContrato(contratosStore.contratoVigente._id, datos)
    : await contratosStore.crearContrato({ ...datos, empleadoId: empleadoContrato.value._id });

  if (exito) mostrandoFormularioContrato.value = false;
}

// Modal dispositivos
const modalDispositivosAbierto = ref(false);
const empleadoDispositivos = ref(null);
const confirmandoDispositivoId = ref(null);

function abrirDispositivos(empleado) {
  empleadoDispositivos.value = empleado;
  dispositivosStore.cargarPorEmpleado(empleado._id);
  modalDispositivosAbierto.value = true;
}

function manejarRevocarDispositivo(dispositivo) {
  if (confirmandoDispositivoId.value !== dispositivo._id) {
    confirmandoDispositivoId.value = dispositivo._id;
    setTimeout(() => {
      if (confirmandoDispositivoId.value === dispositivo._id) confirmandoDispositivoId.value = null;
    }, 4000);
    return;
  }
  confirmandoDispositivoId.value = null;
  dispositivosStore.revocar(dispositivo._id);
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Empleados</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Personal registrado en la empresa.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.EMPLEADO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhUserPlus class="size-4" weight="bold" />
        Nuevo empleado
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <div class="relative min-w-[220px] flex-1">
        <PhMagnifyingGlass class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-sutil" />
        <input
          v-model="terminoBusqueda"
          type="text"
          placeholder="Buscar por nombre o documento"
          aria-label="Buscar empleado"
          class="w-full rounded-xl border border-borde-fuerte bg-fondo-elevado py-2.5 pr-3 pl-9 text-sm text-texto placeholder:text-texto-sutil focus-visible:border-acento"
          @keyup.enter="buscar"
        />
      </div>
      <BaseBoton variante="secundario" ancho="auto" @click="buscar">Buscar</BaseBoton>
      <BaseBoton variante="secundario" ancho="auto" @click="alternarInactivos">
        {{ empleadosStore.filtros.activo ? "Ver dados de baja" : "Ver activos" }}
      </BaseBoton>
    </div>

    <BaseAlerta v-if="empleadosStore.error" tipo="error" class="mt-6">{{ empleadosStore.error }}</BaseAlerta>
    <BaseAlerta v-if="empleadosStore.errorAccion" tipo="error" class="mt-6">{{ empleadosStore.errorAccion }}</BaseAlerta>

    <p v-if="empleadosStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando empleados…</p>

    <div v-else-if="empleadosStore.empleadosPagina.length === 0" class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center">
      <PhUsers class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">
        {{ empleadosStore.filtros.activo ? "Aún no has registrado ningún empleado." : "No hay empleados dados de baja." }}
      </p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="empleado in empleadosStore.empleadosPagina" :key="empleado._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ empleado.personaId.nombres }} {{ empleado.personaId.apellidos }}</p>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="empleado.estado === 'activo' ? 'bg-exito/10 text-exito' : 'bg-error-fondo text-error'"
            >
              {{ ETIQUETAS_ESTADO[empleado.estado] }}
            </span>
          </div>
          <p class="mt-0.5 text-xs text-texto-sutil">
            {{ empleado.personaId.numeroDocumento }} · {{ empleado.cargoId.nombre }} · {{ empleado.sedeId.nombre }} · ingresó
            {{ formatoFecha(empleado.fechaIngreso) }}
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="empleado.activo && puede(MODULOS.CONTRATO, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Contrato"
            @click="abrirContrato(empleado)"
          >
            <PhHandshake class="size-[18px]" />
          </button>
          <button
            v-if="puede(MODULOS.DOCUMENTO, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Documentos"
            @click="abrirDocumentos(empleado)"
          >
            <PhPaperclip class="size-[18px]" />
          </button>
          <button
            v-if="puede(MODULOS.DISPOSITIVO, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Dispositivos"
            @click="abrirDispositivos(empleado)"
          >
            <PhDeviceMobile class="size-[18px]" />
          </button>
          <button
            v-if="empleado.activo && puede(MODULOS.EMPLEADO, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            @click="abrirEditar(empleado)"
          >
            <PhPencilSimple class="size-[18px]" />
          </button>
          <button
            v-if="empleado.activo && puede(MODULOS.EMPLEADO, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === empleado._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarBaja(empleado)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === empleado._id ? "¿Confirmar?" : "Dar de baja" }}
            </span>
          </button>
          <button
            v-if="!empleado.activo && puede(MODULOS.EMPLEADO, ACCIONES.CREAR)"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-acento transition-colors hover:bg-acento/10"
            @click="abrirRecontratar(empleado)"
          >
            <PhArrowCounterClockwise class="size-[14px]" />
            Recontratar
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="empleadosStore.paginacionEmpleados && empleadosStore.paginacionEmpleados.totalPaginas > 1"
      :paginacion="empleadosStore.paginacionEmpleados"
      @anterior="empleadosStore.irAPaginaAnteriorEmpleados"
      @siguiente="empleadosStore.irAPaginaSiguienteEmpleados"
    />

    <BaseModal v-model="modalAbierto" :titulo="empleadoEditando ? 'Editar empleado' : 'Nuevo empleado'">
      <BaseAlerta v-if="empleadosStore.errorGuardado" tipo="error" class="mb-5">{{ empleadosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <template v-if="!empleadoEditando">
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="formulario.nombres" label="Nombres" placeholder="Ana María" requerido />
            <BaseInput v-model="formulario.apellidos" label="Apellidos" placeholder="Gómez Ruiz" requerido />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseSelect v-model="formulario.tipoDocumento" label="Tipo de documento" :opciones="OPCIONES_TIPO_DOCUMENTO" requerido />
            <BaseInput v-model="formulario.numeroDocumento" label="Número de documento" placeholder="1020304050" requerido />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="formulario.telefono" label="Teléfono" placeholder="3001234567" />
            <BaseInput v-model="formulario.email" type="email" label="Correo" placeholder="ana@empresa.com" />
          </div>
          <BaseInput v-model="formulario.fechaNacimiento" type="date" label="Fecha de nacimiento" />
        </template>

        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="formulario.sedeId" label="Sede" :opciones="opcionesSedes" requerido />
          <BaseSelect v-model="formulario.cargoId" label="Cargo" :opciones="opcionesCargos" requerido />
        </div>
        <BaseInput v-if="!empleadoEditando" v-model="formulario.fechaIngreso" type="date" label="Fecha de ingreso" requerido />
        <BaseSelect v-model="formulario.perfilModalidad" label="Modalidad" :opciones="OPCIONES_MODALIDAD" requerido />

        <BaseBoton tipo="submit" :cargando="empleadosStore.guardando" class="mt-2">
          {{ empleadoEditando ? "Guardar cambios" : "Registrar empleado" }}
        </BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalRecontratarAbierto" titulo="Recontratar empleado">
      <BaseAlerta v-if="empleadosStore.errorGuardado" tipo="error" class="mb-5">{{ empleadosStore.errorGuardado }}</BaseAlerta>
      <p class="mb-5 text-sm text-texto-sutil">
        Se creará un nuevo registro de empleado para
        <strong class="text-texto">{{ empleadoRecontratando?.personaId.nombres }} {{ empleadoRecontratando?.personaId.apellidos }}</strong>,
        conservando su historial.
      </p>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarRecontratar">
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="formularioRecontratar.sedeId" label="Sede" :opciones="opcionesSedes" requerido />
          <BaseSelect v-model="formularioRecontratar.cargoId" label="Cargo" :opciones="opcionesCargos" requerido />
        </div>
        <BaseInput v-model="formularioRecontratar.fechaIngreso" type="date" label="Nueva fecha de ingreso" requerido />
        <BaseSelect v-model="formularioRecontratar.perfilModalidad" label="Modalidad" :opciones="OPCIONES_MODALIDAD" requerido />
        <BaseBoton tipo="submit" :cargando="empleadosStore.guardando" class="mt-2">Confirmar recontratación</BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalDocumentosAbierto" :titulo="`Documentos de ${empleadoDocumentos?.personaId.nombres} ${empleadoDocumentos?.personaId.apellidos}`">
      <BaseAlerta tipo="info" class="mb-5">
        El sistema aún no almacena archivos: pega el enlace de donde ya está guardado el documento (Drive, SharePoint, etc.).
      </BaseAlerta>

      <BaseAlerta v-if="documentosStore.error" tipo="error" class="mb-5">{{ documentosStore.error }}</BaseAlerta>
      <BaseAlerta v-if="documentosStore.errorAccion" tipo="error" class="mb-5">{{ documentosStore.errorAccion }}</BaseAlerta>

      <p v-if="documentosStore.cargando" class="text-sm text-texto-sutil">Cargando documentos…</p>
      <ul v-else-if="documentosStore.documentos.length > 0" class="mb-6 flex flex-col divide-y divide-borde">
        <li v-for="documento in documentosStore.documentos" :key="documento._id" class="flex items-center justify-between gap-3 py-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-texto">{{ documento.tipo }}</p>
            <a
              :href="documento.archivoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 truncate text-xs text-acento hover:underline"
            >
              <PhLink class="size-3 shrink-0" />
              {{ documento.archivoUrl }}
            </a>
            <p v-if="documento.vigenciaHasta" class="mt-0.5 text-xs text-texto-sutil">Vigente hasta {{ formatoFecha(documento.vigenciaHasta) }}</p>
          </div>
          <button
            v-if="puede(MODULOS.DOCUMENTO, ACCIONES.ELIMINAR)"
            type="button"
            class="shrink-0 rounded-lg p-2 text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error"
            :aria-label="confirmandoDocumentoId === documento._id ? 'Confirmar eliminación' : 'Eliminar'"
            @click="manejarAnularDocumento(documento)"
          >
            <PhTrash class="size-[16px]" :class="confirmandoDocumentoId === documento._id && 'text-error'" />
          </button>
        </li>
      </ul>
      <p v-else class="mb-6 text-sm text-texto-sutil">Sin documentos cargados todavía.</p>

      <form v-if="puede(MODULOS.DOCUMENTO, ACCIONES.CREAR)" class="flex flex-col gap-4 border-t border-borde pt-5" novalidate @submit.prevent="manejarCrearDocumento">
        <BaseAlerta v-if="documentosStore.errorGuardado" tipo="error">{{ documentosStore.errorGuardado }}</BaseAlerta>
        <BaseInput v-model="formularioDocumento.tipo" label="Tipo de documento" placeholder="Contrato de trabajo" requerido />
        <BaseInput v-model="formularioDocumento.archivoUrl" type="url" label="Enlace del archivo" placeholder="https://..." requerido />
        <BaseInput v-model="formularioDocumento.vigenciaHasta" type="date" label="Vigente hasta (opcional)" />
        <BaseBoton tipo="submit" variante="secundario" :cargando="documentosStore.guardando">Agregar documento</BaseBoton>
      </form>
    </BaseModal>

    <BaseModal
      v-model="modalContratoAbierto"
      :titulo="`Contrato de ${empleadoContrato?.personaId.nombres} ${empleadoContrato?.personaId.apellidos}`"
    >
      <BaseAlerta v-if="contratosStore.error" tipo="error" class="mb-5">{{ contratosStore.error }}</BaseAlerta>
      <p v-if="contratosStore.cargando" class="text-sm text-texto-sutil">Cargando…</p>

      <template v-else>
        <div v-if="contratosStore.contratoVigente" class="mb-6 rounded-xl border border-borde bg-fondo p-4">
          <div class="flex items-center justify-between gap-2">
            <span class="rounded-full bg-exito/10 px-2 py-0.5 text-xs font-medium text-exito">
              Vigente · v{{ contratosStore.contratoVigente.version }}
            </span>
            <span class="text-xs text-texto-sutil">{{ ETIQUETAS_TIPO_VINCULO[contratosStore.contratoVigente.tipoVinculo] }}</span>
          </div>
          <p class="mt-2 text-sm text-texto">
            {{ formatoMoneda(contratosStore.contratoVigente.salario) }} · desde {{ formatoFecha(contratosStore.contratoVigente.fechaInicio) }}
            {{ contratosStore.contratoVigente.fechaFin ? `hasta ${formatoFecha(contratosStore.contratoVigente.fechaFin)}` : "(indefinido)" }}
          </p>
          <button
            v-if="!mostrandoFormularioContrato && puede(MODULOS.CONTRATO, ACCIONES.CREAR)"
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
            @click="abrirFormularioContrato"
          >
            <PhArrowsClockwise class="size-4" />
            Renovar / registrar otrosí
          </button>
        </div>

        <BaseAlerta v-else tipo="info" class="mb-6">Este empleado no tiene un contrato registrado todavía.</BaseAlerta>

        <form
          v-if="mostrandoFormularioContrato || !contratosStore.contratoVigente"
          class="flex flex-col gap-4 border-t border-borde pt-5"
          novalidate
          @submit.prevent="manejarGuardarContrato"
        >
          <BaseAlerta v-if="contratosStore.errorGuardado" tipo="error">{{ contratosStore.errorGuardado }}</BaseAlerta>
          <BaseSelect v-model="formularioContrato.tipoVinculo" label="Tipo de vínculo" :opciones="OPCIONES_TIPO_VINCULO" requerido />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput
              v-model="formularioContrato.fechaInicio"
              type="date"
              :label="contratosStore.contratoVigente ? 'Nueva fecha de inicio' : 'Fecha de inicio'"
              requerido
            />
            <BaseInput v-model="formularioContrato.fechaFin" type="date" label="Fecha de fin (opcional)" />
          </div>
          <BaseInput v-model="formularioContrato.salario" type="number" label="Salario" placeholder="1500000" requerido />
          <BaseBoton tipo="submit" :cargando="contratosStore.guardando" class="mt-1">
            {{ contratosStore.contratoVigente ? "Confirmar otrosí" : "Registrar contrato" }}
          </BaseBoton>
        </form>

        <div v-if="contratosStore.historial.length > 1" class="mt-6 border-t border-borde pt-5">
          <p class="mb-3 text-sm font-medium text-texto">Historial</p>
          <ul class="flex flex-col divide-y divide-borde">
            <li v-for="contrato in contratosStore.historial" :key="contrato._id" class="py-2.5 text-xs text-texto-sutil">
              v{{ contrato.version }} · {{ ETIQUETAS_TIPO_VINCULO[contrato.tipoVinculo] }} · {{ formatoMoneda(contrato.salario) }} ·
              {{ formatoFecha(contrato.fechaInicio) }}{{ contrato.fechaFin ? ` – ${formatoFecha(contrato.fechaFin)}` : "" }}
              <span v-if="!contrato.vigente">(reemplazado)</span>
            </li>
          </ul>
        </div>
      </template>
    </BaseModal>

    <BaseModal
      v-model="modalDispositivosAbierto"
      :titulo="`Dispositivos de ${empleadoDispositivos?.personaId.nombres} ${empleadoDispositivos?.personaId.apellidos}`"
    >
      <BaseAlerta v-if="dispositivosStore.errorPorEmpleado" tipo="error" class="mb-5">{{ dispositivosStore.errorPorEmpleado }}</BaseAlerta>
      <BaseAlerta v-if="dispositivosStore.errorAccion" tipo="error" class="mb-5">{{ dispositivosStore.errorAccion }}</BaseAlerta>

      <p v-if="dispositivosStore.cargandoPorEmpleado" class="text-sm text-texto-sutil">Cargando…</p>
      <ul v-else-if="dispositivosStore.porEmpleado.length > 0" class="flex flex-col divide-y divide-borde">
        <li v-for="dispositivo in dispositivosStore.porEmpleado" :key="dispositivo._id" class="flex items-center justify-between gap-3 py-3">
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-texto">{{ dispositivo.modelo || dispositivo.identificadorDispositivo }}</p>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="dispositivo.estado === 'registrado' ? 'bg-exito/10 text-exito' : 'bg-fondo text-texto-sutil'"
              >
                {{ ETIQUETAS_ESTADO_DISPOSITIVO[dispositivo.estado] }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-texto-sutil">Canal: {{ dispositivo.canal }}</p>
          </div>
          <button
            v-if="dispositivo.estado === 'registrado' && puede(MODULOS.DISPOSITIVO, ACCIONES.EDITAR)"
            type="button"
            class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoDispositivoId === dispositivo._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarRevocarDispositivo(dispositivo)"
          >
            {{ confirmandoDispositivoId === dispositivo._id ? "¿Confirmar?" : "Revocar" }}
          </button>
        </li>
      </ul>
      <p v-else class="text-sm text-texto-sutil">Este empleado no tiene ningún dispositivo registrado.</p>
    </BaseModal>
  </div>
</template>
