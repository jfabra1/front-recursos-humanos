<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { PhCalendarCheck, PhCheckCircle, PhPlus, PhXCircle } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useVacacionesStore } from "@/stores/vacaciones.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_ESTADO_VACACIONES, ETIQUETAS_ESTADO_VACACIONES, ETIQUETAS_TIPO_MOVIMIENTO_VACACIONES } from "@/utils/vacaciones.util";
import { formatoFecha } from "@/utils/formato.util";

const vacacionesStore = useVacacionesStore();
const empleadosStore = useEmpleadosStore();
const usuariosStore = useUsuariosStore();
const { puede } = usePermisos();

const procesandoId = ref(null);
const confirmandoCancelarId = ref(null);
const empleadoSaldoSeleccionado = ref("");

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  if (usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
  vacacionesStore.cargarSolicitudes();
});

const opcionesEmpleados = computed(() =>
  empleadosStore.empleados.map((empleado) => ({ valor: empleado._id, texto: `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` })),
);

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}

function nombreUsuario(usuarioId) {
  return usuariosStore.usuarios.find((usuario) => usuario._id === usuarioId)?.email || "—";
}

function formatoDias(dias) {
  return Number(dias).toFixed(2).replace(/\.00$/, "");
}

watch(empleadoSaldoSeleccionado, (empleadoId) => {
  if (empleadoId) vacacionesStore.consultarSaldo(empleadoId);
});

async function manejarAprobar(solicitud) {
  procesandoId.value = solicitud._id;
  await vacacionesStore.aprobar(solicitud._id);
  procesandoId.value = null;
}

async function manejarRechazar(solicitud) {
  procesandoId.value = solicitud._id;
  await vacacionesStore.rechazar(solicitud._id);
  procesandoId.value = null;
}

function manejarCancelar(solicitud) {
  if (confirmandoCancelarId.value !== solicitud._id) {
    confirmandoCancelarId.value = solicitud._id;
    setTimeout(() => {
      if (confirmandoCancelarId.value === solicitud._id) confirmandoCancelarId.value = null;
    }, 4000);
    return;
  }
  confirmandoCancelarId.value = null;
  vacacionesStore.cancelar(solicitud._id);
}

// Modal causar saldo
const modalCausarAbierto = ref(false);
const formularioCausar = reactive({ fechaCorte: "" });

function abrirCausar() {
  Object.assign(formularioCausar, { fechaCorte: "" });
  modalCausarAbierto.value = true;
}

async function manejarCausar() {
  if (await vacacionesStore.causarSaldo(empleadoSaldoSeleccionado.value, formularioCausar.fechaCorte)) {
    modalCausarAbierto.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
      Vacaciones
      <AyudaInfo
        texto="El saldo se causa proporcionalmente (15 días por cada 360 días trabajados) y se reconstruye siempre sumando el historial de movimientos: nunca se edita directamente."
      />
    </h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Saldo, historial de movimientos y solicitudes de cada empleado.</p>

    <section class="mt-8 rounded-2xl border border-borde bg-fondo-elevado p-6">
      <h2 class="text-sm font-semibold text-texto">Consultar saldo</h2>
      <div class="mt-4 flex flex-wrap items-end gap-3">
        <BaseSelect v-model="empleadoSaldoSeleccionado" label="Empleado" placeholder="Selecciona un empleado" class="w-64" :opciones="opcionesEmpleados" />
        <BaseBoton v-if="empleadoSaldoSeleccionado && puede(MODULOS.VACACION, ACCIONES.CREAR)" ancho="auto" variante="secundario" @click="abrirCausar">
          <PhPlus class="size-4" weight="bold" />
          Causar saldo
        </BaseBoton>
      </div>

      <template v-if="empleadoSaldoSeleccionado">
        <p v-if="vacacionesStore.cargandoSaldo" class="mt-5 text-sm text-texto-sutil">Cargando saldo…</p>
        <BaseAlerta v-else-if="vacacionesStore.errorSaldo" tipo="error" class="mt-5">{{ vacacionesStore.errorSaldo }}</BaseAlerta>
        <BaseAlerta v-else-if="!vacacionesStore.saldo" tipo="info" class="mt-5">Este empleado todavía no tiene saldo causado.</BaseAlerta>
        <template v-else>
          <div class="mt-5 grid grid-cols-3 gap-3">
            <div class="rounded-xl border border-borde bg-fondo p-4">
              <p class="text-xs text-texto-sutil">Acumulados</p>
              <p class="mt-1 text-lg font-semibold text-texto">{{ formatoDias(vacacionesStore.saldo.diasAcumulados) }}</p>
            </div>
            <div class="rounded-xl border border-borde bg-fondo p-4">
              <p class="text-xs text-texto-sutil">Disfrutados</p>
              <p class="mt-1 text-lg font-semibold text-texto">{{ formatoDias(vacacionesStore.saldo.diasDisfrutados) }}</p>
            </div>
            <div class="rounded-xl border border-borde bg-fondo p-4">
              <p class="text-xs text-texto-sutil">Pendientes</p>
              <p class="mt-1 text-lg font-semibold text-acento">{{ formatoDias(vacacionesStore.saldo.diasPendientes) }}</p>
            </div>
          </div>
          <p class="mt-2 text-xs text-texto-sutil">Corte al {{ formatoFecha(vacacionesStore.saldo.fechaCorte) }}</p>

          <ul v-if="vacacionesStore.movimientos.length > 0" class="mt-4 flex flex-col divide-y divide-borde">
            <li v-for="movimiento in vacacionesStore.movimientos" :key="movimiento._id" class="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div>
                <span class="font-medium text-texto">{{ ETIQUETAS_TIPO_MOVIMIENTO_VACACIONES[movimiento.tipo] }}</span>
                <span class="ml-2 text-texto-sutil">{{ movimiento.descripcion }}</span>
              </div>
              <div class="flex shrink-0 items-center gap-3 text-xs text-texto-sutil">
                <span :class="movimiento.dias < 0 ? 'text-error' : 'text-exito'">{{ movimiento.dias > 0 ? "+" : "" }}{{ formatoDias(movimiento.dias) }}</span>
                <span>{{ formatoFecha(movimiento.fecha) }}</span>
              </div>
            </li>
          </ul>
        </template>
      </template>
    </section>

    <h2 class="mt-10 text-sm font-semibold text-texto">Solicitudes</h2>
    <div class="mt-3 flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="vacacionesStore.filtros.estado"
        label="Estado"
        placeholder="Todos"
        class="w-48"
        :opciones="OPCIONES_ESTADO_VACACIONES"
        @update:model-value="vacacionesStore.cargarSolicitudes"
      />
      <BaseSelect
        v-model="vacacionesStore.filtros.empleadoId"
        label="Empleado"
        placeholder="Todos"
        class="w-56"
        :opciones="opcionesEmpleados"
        @update:model-value="vacacionesStore.cargarSolicitudes"
      />
    </div>

    <BaseAlerta v-if="vacacionesStore.error" tipo="error" class="mt-6">{{ vacacionesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="vacacionesStore.errorAccion" tipo="error" class="mt-6">{{ vacacionesStore.errorAccion }}</BaseAlerta>

    <p v-if="vacacionesStore.cargando" class="mt-6 text-sm text-texto-sutil">Cargando solicitudes…</p>

    <div
      v-else-if="vacacionesStore.solicitudes.length === 0"
      class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhCalendarCheck class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay solicitudes con estos filtros.</p>
    </div>

    <ul v-else class="mt-4 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="solicitud in vacacionesStore.solicitudes" :key="solicitud._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ nombreEmpleado(solicitud.empleadoId) }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_ESTADO_VACACIONES[solicitud.estado] }}</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            {{ formatoFecha(solicitud.fechaInicio) }} – {{ formatoFecha(solicitud.fechaFin) }} · {{ formatoDias(solicitud.diasSolicitados) }} días
          </p>
          <p v-if="solicitud.estado === 'pendiente_segunda_aprobacion'" class="mt-1 text-xs text-texto-sutil">
            Primera aprobación: {{ nombreUsuario(solicitud.primerAprobadorId) }} — falta la de otra persona.
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <template
            v-if="
              (solicitud.estado === 'pendiente' || solicitud.estado === 'pendiente_segunda_aprobacion') &&
              puede(MODULOS.VACACION, ACCIONES.APROBAR)
            "
          >
            <button
              type="button"
              :disabled="procesandoId === solicitud._id"
              class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error disabled:opacity-50"
              aria-label="Rechazar"
              @click="manejarRechazar(solicitud)"
            >
              <PhXCircle class="size-5" />
            </button>
            <button
              type="button"
              :disabled="procesandoId === solicitud._id"
              class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-exito/10 hover:text-exito disabled:opacity-50"
              aria-label="Aprobar"
              @click="manejarAprobar(solicitud)"
            >
              <PhCheckCircle class="size-5" />
            </button>
          </template>
          <BaseBoton
            v-if="solicitud.estado === 'aprobada' && puede(MODULOS.VACACION, ACCIONES.EDITAR)"
            ancho="auto"
            variante="secundario"
            @click="manejarCancelar(solicitud)"
          >
            {{ confirmandoCancelarId === solicitud._id ? "¿Confirmar cancelación?" : "Cancelar" }}
          </BaseBoton>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="vacacionesStore.paginacion && vacacionesStore.paginacion.totalPaginas > 1"
      :paginacion="vacacionesStore.paginacion"
      @anterior="vacacionesStore.irAPaginaAnterior"
      @siguiente="vacacionesStore.irAPaginaSiguiente"
    />

    <BaseModal v-model="modalCausarAbierto" titulo="Causar saldo de vacaciones">
      <p class="mb-5 text-sm text-texto-sutil">
        Aplica la fórmula proporcional (15 × días de servicio desde la última causación / 360) hasta la fecha de corte que indiques.
      </p>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarCausar">
        <BaseAlerta v-if="vacacionesStore.errorCausar" tipo="error">{{ vacacionesStore.errorCausar }}</BaseAlerta>
        <BaseInput v-model="formularioCausar.fechaCorte" type="date" label="Fecha de corte" requerido />
        <BaseBoton tipo="submit" :cargando="vacacionesStore.causando" class="mt-1">Causar</BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
