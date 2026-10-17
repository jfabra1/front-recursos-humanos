<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  PhArrowCounterClockwise,
  PhArrowsClockwise,
  PhCheckCircle,
  PhClockCounterClockwise,
  PhDeviceMobile,
  PhDownloadSimple,
  PhHandshake,
  PhIdentificationBadge,
  PhLink,
  PhMagnifyingGlass,
  PhPaperclip,
  PhPencilSimple,
  PhProhibit,
  PhQrCode,
  PhSignature,
  PhTrash,
  PhUserPlus,
  PhUsers,
} from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import ModalEvidenciaFirma from "@/componentes/comunes/ModalEvidenciaFirma.vue";
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
import { useUsuariosStore } from "@/stores/usuarios.store";
import { useInstrumentosColectivosStore } from "@/stores/instrumentosColectivos.store";
import { useAuditoriaStore } from "@/stores/auditoria.store";
import { useSolicitudFirmaStore } from "@/stores/solicitudFirma.store";
import { usePlantillaContratoStore } from "@/stores/plantillaContrato.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_DOCUMENTO, ETIQUETAS_TIPO_DOCUMENTO, OPCIONES_MODALIDAD, ETIQUETAS_MODALIDAD, ETIQUETAS_ESTADO } from "@/utils/empleado.util";
import { OPCIONES_TIPO_VINCULO, ETIQUETAS_TIPO_VINCULO } from "@/utils/contrato.util";
import { ETIQUETAS_ESTADO_DISPOSITIVO } from "@/utils/jornada.util";
import { ETIQUETAS_ACCION_AUDITORIA } from "@/utils/auditoria.util";
import { formatoFecha, formatoFechaHora, formatoMoneda } from "@/utils/formato.util";

const empleadosStore = useEmpleadosStore();
const sedesStore = useSedesStore();
const cargosStore = useCargosStore();
const documentosStore = useDocumentosStore();
const dispositivosStore = useDispositivosStore();
const contratosStore = useContratosStore();
const usuariosStore = useUsuariosStore();
const instrumentosStore = useInstrumentosColectivosStore();
const auditoriaStore = useAuditoriaStore();
const solicitudFirmaStore = useSolicitudFirmaStore();
const plantillasContratoStore = usePlantillaContratoStore();
const { puede } = usePermisos();

onMounted(() => {
  empleadosStore.cargarPaginaEmpleados();
  if (sedesStore.sedes.length === 0) sedesStore.cargarSedes();
  if (cargosStore.cargos.length === 0) cargosStore.cargarCargos();
  if (instrumentosStore.instrumentos.length === 0) instrumentosStore.cargarInstrumentos();
  // Lista completa sin paginar, solo para resolver "¿este empleado ya tiene un usuario?" —
  // igual que la usan Auditoría/Vacaciones/etc. para resolver usuarioId → email. Se omite si el
  // rol actual ni siquiera puede ver Usuarios (RRHH y administrador_empresa sí pueden).
  if (puede(MODULOS.USUARIO, ACCIONES.LEER) && usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
});

function usuarioDeEmpleado(empleadoId) {
  // Sin esta guarda, un empleadoId vacío (ej. antes de abrir el modal por primera vez, cuando
  // `empleadoUsuario` todavía es null) podía "encontrar" por accidente un usuario sin vincular
  // (su `empleadoId` también es `undefined`) — `.find()` los trataba como iguales.
  if (!empleadoId) return undefined;
  return usuariosStore.usuarios.find((usuario) => usuario.empleadoId === empleadoId);
}

const opcionesSedes = computed(() => sedesStore.sedes.map((sede) => ({ valor: sede._id, texto: sede.nombre })));
const opcionesCargos = computed(() => cargosStore.cargos.map((cargo) => ({ valor: cargo._id, texto: cargo.nombre })));
const opcionesInstrumentos = computed(() =>
  instrumentosStore.instrumentos.filter((instrumento) => instrumento.activo).map((instrumento) => ({ valor: instrumento._id, texto: instrumento.nombre })),
);

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
  instrumentoColectivoId: "",
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
    instrumentoColectivoId: "",
  });
  modalAbierto.value = true;
}

function abrirEditar(empleado) {
  empleadoEditando.value = empleado;
  Object.assign(formulario, {
    nombres: empleado.personaId.nombres,
    apellidos: empleado.personaId.apellidos,
    tipoDocumento: empleado.personaId.tipoDocumento,
    numeroDocumento: empleado.personaId.numeroDocumento,
    fechaNacimiento: empleado.personaId.fechaNacimiento ? empleado.personaId.fechaNacimiento.slice(0, 10) : "",
    telefono: empleado.personaId.telefono || "",
    email: empleado.personaId.email || "",
    sedeId: empleado.sedeId._id,
    cargoId: empleado.cargoId._id,
    perfilModalidad: empleado.perfilModalidad,
    instrumentoColectivoId: empleado.instrumentoColectivoId?._id || "",
  });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  if (empleadoEditando.value) {
    const datos = {
      sedeId: formulario.sedeId,
      cargoId: formulario.cargoId,
      perfilModalidad: formulario.perfilModalidad,
      // El backend no tiene (todavía) una forma explícita de "quitar" la convención ya asignada
      // — solo se manda el campo cuando hay una seleccionada, igual que al crear.
      ...(formulario.instrumentoColectivoId ? { instrumentoColectivoId: formulario.instrumentoColectivoId } : {}),
      datosPersona: {
        nombres: formulario.nombres,
        apellidos: formulario.apellidos,
        tipoDocumento: formulario.tipoDocumento,
        numeroDocumento: formulario.numeroDocumento,
        ...(formulario.fechaNacimiento ? { fechaNacimiento: formulario.fechaNacimiento } : {}),
        ...(formulario.telefono ? { telefono: formulario.telefono } : {}),
        ...(formulario.email ? { email: formulario.email } : {}),
      },
    };
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
    ...(formulario.instrumentoColectivoId ? { instrumentoColectivoId: formulario.instrumentoColectivoId } : {}),
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
  mostrandoFormularioFirma.value = false;
  solicitudFirmaStore.ultimaCreada = null;
  contratosStore.cargarHistorial(empleado._id);
  solicitudFirmaStore.cargarPorEmpleado(empleado._id);
  if (plantillasContratoStore.plantillas.length === 0) plantillasContratoStore.cargarPlantillas();
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
  if (vigente) contratosStore.cargarAlertaOtrosi(vigente._id);
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

// Firma del contrato — si hay un otrosí sin confirmar, ES ese el documento que hay que firmar
// (el vigente ya pasó por su propio ciclo de firma hace tiempo); si no hay otrosí en curso, se
// trabaja sobre el vigente como siempre.
const contratoFirma = computed(() => contratosStore.otrosiBorrador || contratosStore.contratoVigente);

const mostrandoFormularioFirma = ref(false);
const plantillaSeleccionadaId = ref("");

function abrirFormularioFirma() {
  plantillaSeleccionadaId.value = "";
  mostrandoFormularioFirma.value = true;
}

async function manejarSolicitarFirma() {
  const exito = await solicitudFirmaStore.crear({ contratoId: contratoFirma.value._id, plantillaId: plantillaSeleccionadaId.value });
  if (exito) {
    mostrandoFormularioFirma.value = false;
    contratosStore.cargarHistorial(empleadoContrato.value._id);
  }
}

async function manejarDescargarPdfContrato() {
  const plantilla = plantillasContratoStore.plantillas.find((item) => item._id === plantillaSeleccionadaId.value);
  if (!plantilla) return;
  await plantillasContratoStore.descargarPdf(plantilla, contratoFirma.value._id);
}

async function manejarAnularSolicitudFirma(solicitud) {
  await solicitudFirmaStore.anular(solicitud._id);
  contratosStore.cargarHistorial(empleadoContrato.value._id);
}

async function manejarConfirmarOtrosi() {
  await contratosStore.confirmarOtrosi(contratosStore.otrosiBorrador._id);
}

async function manejarDescartarOtrosi() {
  await contratosStore.descartarOtrosi(contratosStore.otrosiBorrador._id);
}

const solicitudFirmaPendiente = computed(() =>
  solicitudFirmaStore.solicitudes.find((solicitud) => solicitud.documentoId === contratoFirma.value?._id && solicitud.estado === "pendiente"),
);

// Para "Ver evidencia": la firmada tiene prioridad (es el estado final), si no hay una firmada
// se muestra la pendiente (línea de tiempo parcial, útil para ver qué ha pasado hasta ahora).
const solicitudFirmaParaEvidencia = computed(() => {
  const delContrato = solicitudFirmaStore.solicitudes.filter((solicitud) => solicitud.documentoId === contratoFirma.value?._id);
  return delContrato.find((solicitud) => solicitud.estado === "firmado") || delContrato.find((solicitud) => solicitud.estado === "pendiente");
});

const modalEvidenciaAbierto = ref(false);

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

// Modal ver detalles (datos completos del empleado + su usuario vinculado, si tiene)
const modalDetalleAbierto = ref(false);
const empleadoDetalle = ref(null);

function abrirDetalle(empleado) {
  empleadoDetalle.value = empleado;
  modalDetalleAbierto.value = true;
}

// Modal trazabilidad (historial de auditoría de este empleado puntual, reutiliza GET /auditoria
// filtrado por entidad+entidadId — no es un sistema nuevo, es el mismo de AuditoriaVista.vue)
const modalTrazabilidadAbierto = ref(false);
const empleadoTrazabilidad = ref(null);

function abrirTrazabilidad(empleado) {
  empleadoTrazabilidad.value = empleado;
  auditoriaStore.cargarPorEntidad("Empleado", empleado._id);
  modalTrazabilidadAbierto.value = true;
}

function nombreUsuarioAuditoria(registro) {
  const usuario = usuariosStore.usuarios.find((item) => item._id === registro.usuarioId);
  return usuario?.email || "Sistema";
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
            <span
              v-if="puede(MODULOS.USUARIO, ACCIONES.LEER)"
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="usuarioDeEmpleado(empleado._id) ? 'bg-acento/10 text-acento' : 'bg-fondo text-texto-sutil'"
            >
              {{ usuarioDeEmpleado(empleado._id) ? "Con acceso" : "Sin acceso" }}
            </span>
          </div>
          <p class="mt-0.5 text-xs text-texto-sutil">
            {{ empleado.personaId.numeroDocumento }} · {{ empleado.cargoId.nombre }} · {{ empleado.sedeId.nombre }} · ingresó
            {{ formatoFecha(empleado.fechaIngreso) }}
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Ver detalles"
            title="Ver detalles"
            @click="abrirDetalle(empleado)"
          >
            <PhIdentificationBadge class="size-[18px]" />
          </button>
          <button
            v-if="puede(MODULOS.AUDITORIA, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Trazabilidad"
            title="Trazabilidad"
            @click="abrirTrazabilidad(empleado)"
          >
            <PhClockCounterClockwise class="size-[18px]" />
          </button>
          <button
            v-if="empleado.activo && puede(MODULOS.CONTRATO, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Contrato"
            title="Contrato"
            @click="abrirContrato(empleado)"
          >
            <PhHandshake class="size-[18px]" />
          </button>
          <button
            v-if="puede(MODULOS.DOCUMENTO, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Documentos"
            title="Documentos"
            @click="abrirDocumentos(empleado)"
          >
            <PhPaperclip class="size-[18px]" />
          </button>
          <button
            v-if="puede(MODULOS.DISPOSITIVO, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Dispositivos"
            title="Dispositivos"
            @click="abrirDispositivos(empleado)"
          >
            <PhDeviceMobile class="size-[18px]" />
          </button>
          <button
            v-if="empleado.activo && puede(MODULOS.EMPLEADO, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            title="Editar"
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
      v-if="empleadosStore.paginacionEmpleados"
      :paginacion="empleadosStore.paginacionEmpleados"
      :limite="empleadosStore.limite"
      @anterior="empleadosStore.irAPaginaAnteriorEmpleados"
      @siguiente="empleadosStore.irAPaginaSiguienteEmpleados"
      @cambiar-limite="empleadosStore.cambiarLimiteEmpleados"
    />

    <BaseModal v-model="modalAbierto" :titulo="empleadoEditando ? 'Editar empleado' : 'Nuevo empleado'">
      <BaseAlerta v-if="empleadosStore.errorGuardado" tipo="error" class="mb-5">{{ empleadosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
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

        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="formulario.sedeId" label="Sede" :opciones="opcionesSedes" requerido />
          <BaseSelect v-model="formulario.cargoId" label="Cargo" :opciones="opcionesCargos" requerido />
        </div>
        <BaseInput v-if="!empleadoEditando" v-model="formulario.fechaIngreso" type="date" label="Fecha de ingreso" requerido />
        <BaseSelect v-model="formulario.perfilModalidad" label="Modalidad" :opciones="OPCIONES_MODALIDAD" requerido />
        <BaseSelect
          v-model="formulario.instrumentoColectivoId"
          label="Convención colectiva (opcional)"
          placeholder="Ninguna"
          :opciones="opcionesInstrumentos"
        />

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
            :title="confirmandoDocumentoId === documento._id ? 'Confirmar eliminación' : 'Eliminar'"
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
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-exito/10 px-2 py-0.5 text-xs font-medium text-exito">
                Vigente · v{{ contratosStore.contratoVigente.version }}
              </span>
              <span
                v-if="contratosStore.contratoVigente.estadoFirma === 'firmado'"
                class="rounded-full bg-exito/10 px-2 py-0.5 text-xs font-medium text-exito"
              >
                Firmado
              </span>
              <span
                v-else-if="contratosStore.contratoVigente.estadoFirma === 'pendiente'"
                class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento"
              >
                Pendiente de firma
              </span>
            </div>
            <span class="text-xs text-texto-sutil">{{ ETIQUETAS_TIPO_VINCULO[contratosStore.contratoVigente.tipoVinculo] }}</span>
          </div>
          <p class="mt-2 text-sm text-texto">
            {{ formatoMoneda(contratosStore.contratoVigente.salario) }} · desde {{ formatoFecha(contratosStore.contratoVigente.fechaInicio) }}
            {{ contratosStore.contratoVigente.fechaFin ? `hasta ${formatoFecha(contratosStore.contratoVigente.fechaFin)}` : "(indefinido)" }}
          </p>
          <button
            v-if="!mostrandoFormularioContrato && !contratosStore.otrosiBorrador && puede(MODULOS.CONTRATO, ACCIONES.CREAR)"
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
            @click="abrirFormularioContrato"
          >
            <PhArrowsClockwise class="size-4" />
            Renovar / registrar otrosí
          </button>
        </div>

        <div v-if="contratosStore.otrosiBorrador" class="mb-6 rounded-xl border border-acento/30 bg-acento/5 p-4">
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">Otrosí sin confirmar</span>
            <span class="text-xs text-texto-sutil">{{ ETIQUETAS_TIPO_VINCULO[contratosStore.otrosiBorrador.tipoVinculo] }}</span>
          </div>
          <p class="mt-2 text-sm text-texto">
            {{ formatoMoneda(contratosStore.otrosiBorrador.salario) }} · desde {{ formatoFecha(contratosStore.otrosiBorrador.fechaInicio) }}
            {{ contratosStore.otrosiBorrador.fechaFin ? `hasta ${formatoFecha(contratosStore.otrosiBorrador.fechaFin)}` : "(indefinido)" }}
          </p>
          <p class="mt-1.5 text-xs text-texto-sutil">
            El contrato vigente sigue activo (y sigue alertando si está por vencer) hasta que confirmes este otrosí — hazlo solo cuando ya esté firmado,
            digital o en papel.
          </p>
          <div class="mt-3 flex flex-wrap gap-4">
            <button
              v-if="puede(MODULOS.CONTRATO, ACCIONES.CREAR)"
              type="button"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-exito hover:underline"
              @click="manejarConfirmarOtrosi"
            >
              <PhCheckCircle class="size-4" />
              Confirmar otrosí
            </button>
            <button
              v-if="puede(MODULOS.CONTRATO, ACCIONES.EDITAR)"
              type="button"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-error hover:underline"
              @click="manejarDescartarOtrosi"
            >
              <PhProhibit class="size-4" />
              Descartar
            </button>
          </div>
        </div>

        <BaseAlerta v-else tipo="info" class="mb-6">Este empleado no tiene un contrato registrado todavía.</BaseAlerta>

        <div
          v-if="contratoFirma && puede(MODULOS.SOLICITUD_FIRMA, ACCIONES.LEER)"
          class="mb-6 rounded-xl border border-borde bg-fondo p-4"
        >
          <h3 class="flex items-center gap-1.5 text-sm font-semibold text-texto">
            <PhSignature class="size-4" /> Firma electrónica
            <span v-if="contratosStore.otrosiBorrador" class="text-xs font-normal text-texto-sutil">(del otrosí sin confirmar)</span>
          </h3>

          <BaseAlerta v-if="solicitudFirmaStore.errorCreacion" tipo="error" class="mt-3">{{ solicitudFirmaStore.errorCreacion }}</BaseAlerta>
          <BaseAlerta v-if="solicitudFirmaStore.errorAccion" tipo="error" class="mt-3">{{ solicitudFirmaStore.errorAccion }}</BaseAlerta>

          <!-- Enlace/QR recién generado -->
          <div v-if="solicitudFirmaStore.ultimaCreada" class="mt-3">
            <p class="text-xs text-texto-sutil">Se envió este enlace al correo del empleado. También puedes mostrarle este QR para que firme desde su celular:</p>
            <img :src="solicitudFirmaStore.ultimaCreada.codigoQr" alt="Código QR para firmar" class="mt-3 size-40 rounded-lg border border-borde" />
            <div class="mt-3 flex items-center gap-2 rounded-lg border border-borde bg-fondo-elevado px-3 py-2">
              <PhLink class="size-4 shrink-0 text-texto-sutil" />
              <p class="truncate text-xs text-texto-sutil">{{ solicitudFirmaStore.ultimaCreada.enlace }}</p>
            </div>
          </div>

          <!-- Ya firmado -->
          <template v-else-if="contratoFirma.estadoFirma === 'firmado'">
            <p class="mt-2 text-sm text-texto-sutil">El empleado ya firmó este contrato electrónicamente.</p>
            <button
              v-if="solicitudFirmaParaEvidencia"
              type="button"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
              @click="modalEvidenciaAbierto = true"
            >
              <PhClockCounterClockwise class="size-4" />
              Ver evidencia de firma
            </button>
          </template>

          <!-- Pendiente (solicitud creada en una sesión anterior) -->
          <template v-else-if="contratoFirma.estadoFirma === 'pendiente'">
            <p class="mt-2 text-sm text-texto-sutil">Hay una solicitud de firma pendiente — se envió un enlace al correo del empleado.</p>
            <div class="mt-3 flex flex-wrap items-center gap-4">
              <button
                v-if="solicitudFirmaPendiente && puede(MODULOS.SOLICITUD_FIRMA, ACCIONES.EDITAR)"
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-medium text-error hover:underline"
                @click="manejarAnularSolicitudFirma(solicitudFirmaPendiente)"
              >
                <PhProhibit class="size-4" />
                Anular solicitud
              </button>
              <button
                v-if="solicitudFirmaParaEvidencia"
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
                @click="modalEvidenciaAbierto = true"
              >
                <PhClockCounterClockwise class="size-4" />
                Ver evidencia
              </button>
            </div>
          </template>

          <!-- Sin solicitar todavía -->
          <template v-else>
            <button
              v-if="!mostrandoFormularioFirma && puede(MODULOS.SOLICITUD_FIRMA, ACCIONES.CREAR)"
              type="button"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-acento hover:underline"
              @click="abrirFormularioFirma"
            >
              <PhQrCode class="size-4" />
              Solicitar firma
            </button>

            <form v-if="mostrandoFormularioFirma" class="mt-3 flex flex-col gap-3" novalidate @submit.prevent="manejarSolicitarFirma">
              <BaseSelect
                v-model="plantillaSeleccionadaId"
                label="Plantilla de contrato"
                :opciones="plantillasContratoStore.plantillas.map((plantilla) => ({ valor: plantilla._id, texto: plantilla.nombre }))"
                requerido
              />
              <BaseAlerta v-if="plantillasContratoStore.errorDescargar" tipo="error">{{ plantillasContratoStore.errorDescargar }}</BaseAlerta>
              <div class="flex flex-wrap gap-2">
                <BaseBoton tipo="submit" ancho="auto" :cargando="solicitudFirmaStore.creando">Enviar enlace de firma</BaseBoton>
                <BaseBoton
                  ancho="auto"
                  variante="secundario"
                  :deshabilitado="!plantillaSeleccionadaId"
                  :cargando="plantillasContratoStore.descargandoId === plantillaSeleccionadaId"
                  @click="manejarDescargarPdfContrato"
                >
                  <PhDownloadSimple class="size-4" />
                  Descargar PDF para firma física
                </BaseBoton>
              </div>
              <p class="text-xs text-texto-sutil">Para empleados sin dispositivo, o que firman en la misma oficina: imprime el contrato ya diligenciado.</p>
            </form>
          </template>
        </div>

        <form
          v-if="mostrandoFormularioContrato || !contratosStore.contratoVigente"
          class="flex flex-col gap-4 border-t border-borde pt-5"
          novalidate
          @submit.prevent="manejarGuardarContrato"
        >
          <BaseAlerta v-if="contratosStore.errorGuardado" tipo="error">{{ contratosStore.errorGuardado }}</BaseAlerta>
          <BaseAlerta v-if="contratosStore.alertaOtrosi?.superaLimite" tipo="info">
            Este sería el otrosí número {{ contratosStore.alertaOtrosi.siguienteProrrogaNumero }} de este contrato a término fijo — la ley permite máximo
            {{ contratosStore.alertaOtrosi.limitePeriodoCorto }} prórrogas por períodos cortos; a partir de esta, el período no debería ser inferior a 1 año.
            Esto es solo informativo, la decisión es tuya.
          </BaseAlerta>
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
            {{ contratosStore.contratoVigente ? "Registrar otrosí (borrador)" : "Registrar contrato" }}
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

    <BaseModal
      v-model="modalDetalleAbierto"
      :titulo="empleadoDetalle ? `${empleadoDetalle.personaId.nombres} ${empleadoDetalle.personaId.apellidos}` : 'Detalle del empleado'"
    >
      <template v-if="empleadoDetalle">
        <h3 class="text-sm font-semibold text-texto">Datos personales</h3>
        <dl class="mt-3 flex flex-col gap-3 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Documento</dt>
              <dd class="mt-0.5 text-texto">
                {{ ETIQUETAS_TIPO_DOCUMENTO[empleadoDetalle.personaId.tipoDocumento] }} {{ empleadoDetalle.personaId.numeroDocumento }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Fecha de nacimiento</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDetalle.personaId.fechaNacimiento ? formatoFecha(empleadoDetalle.personaId.fechaNacimiento) : "—" }}</dd>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Teléfono</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDetalle.personaId.telefono || "—" }}</dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Correo</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDetalle.personaId.email || "—" }}</dd>
            </div>
          </div>
        </dl>

        <h3 class="mt-6 border-t border-borde pt-5 text-sm font-semibold text-texto">Datos laborales</h3>
        <dl class="mt-3 flex flex-col gap-3 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Sede</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDetalle.sedeId.nombre }}</dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Cargo</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDetalle.cargoId.nombre }}</dd>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Modalidad</dt>
              <dd class="mt-0.5 text-texto">{{ ETIQUETAS_MODALIDAD[empleadoDetalle.perfilModalidad] }}</dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Convención colectiva</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDetalle.instrumentoColectivoId?.nombre || "—" }}</dd>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Fecha de ingreso</dt>
              <dd class="mt-0.5 text-texto">{{ formatoFecha(empleadoDetalle.fechaIngreso) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Estado</dt>
              <dd class="mt-0.5">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="empleadoDetalle.estado === 'activo' ? 'bg-exito/10 text-exito' : 'bg-error-fondo text-error'"
                >
                  {{ ETIQUETAS_ESTADO[empleadoDetalle.estado] }}
                </span>
              </dd>
            </div>
          </div>
        </dl>

        <template v-if="puede(MODULOS.USUARIO, ACCIONES.LEER)">
          <h3 class="mt-6 border-t border-borde pt-5 text-sm font-semibold text-texto">Usuario del sistema</h3>
          <dl v-if="usuarioDeEmpleado(empleadoDetalle._id)" class="mt-3 flex flex-col gap-3 text-sm">
            <div>
              <dt class="text-xs text-texto-sutil">Correo</dt>
              <dd class="mt-0.5 text-texto">{{ usuarioDeEmpleado(empleadoDetalle._id).email }}</dd>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <dt class="text-xs text-texto-sutil">Rol</dt>
                <dd class="mt-0.5 text-texto">{{ usuarioDeEmpleado(empleadoDetalle._id).rolId?.nombre }}</dd>
              </div>
              <div>
                <dt class="text-xs text-texto-sutil">Estado</dt>
                <dd class="mt-0.5">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="usuarioDeEmpleado(empleadoDetalle._id).estado === 'activo' ? 'bg-exito/10 text-exito' : 'bg-error-fondo text-error'"
                  >
                    {{ usuarioDeEmpleado(empleadoDetalle._id).estado === "activo" ? "Activo" : "Bloqueado" }}
                  </span>
                </dd>
              </div>
            </div>
          </dl>
          <p v-else class="mt-3 text-sm text-texto-sutil">Este empleado no tiene un usuario con acceso al sistema.</p>
        </template>
      </template>
    </BaseModal>

    <BaseModal
      v-model="modalTrazabilidadAbierto"
      :titulo="empleadoTrazabilidad ? `Trazabilidad de ${empleadoTrazabilidad.personaId.nombres} ${empleadoTrazabilidad.personaId.apellidos}` : 'Trazabilidad'"
    >
      <BaseAlerta v-if="auditoriaStore.errorEntidad" tipo="error" class="mb-5">{{ auditoriaStore.errorEntidad }}</BaseAlerta>

      <p v-if="auditoriaStore.cargandoEntidad" class="text-sm text-texto-sutil">Cargando…</p>
      <p v-else-if="auditoriaStore.registrosEntidad.length === 0" class="text-sm text-texto-sutil">
        Sin cambios registrados todavía para este empleado.
      </p>
      <ul v-else class="flex flex-col divide-y divide-borde">
        <li v-for="registro in auditoriaStore.registrosEntidad" :key="registro._id" class="py-3">
          <div class="flex items-center gap-2.5">
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_ACCION_AUDITORIA[registro.accion] }}</span>
          </div>
          <p class="mt-1 text-sm text-texto">{{ registro.detalle }}</p>
          <p class="mt-1 text-xs text-texto-sutil">{{ nombreUsuarioAuditoria(registro) }} · {{ formatoFechaHora(registro.createdAt) }}</p>
        </li>
      </ul>

      <BasePaginacion
        v-if="auditoriaStore.paginacionEntidad"
        :paginacion="auditoriaStore.paginacionEntidad"
        :limite="auditoriaStore.limiteEntidad"
        @anterior="auditoriaStore.irAPaginaAnteriorEntidad"
        @siguiente="auditoriaStore.irAPaginaSiguienteEntidad"
        @cambiar-limite="auditoriaStore.cambiarLimiteEntidad"
      />
    </BaseModal>

    <ModalEvidenciaFirma v-model="modalEvidenciaAbierto" :solicitud="solicitudFirmaParaEvidencia" />
  </div>
</template>
