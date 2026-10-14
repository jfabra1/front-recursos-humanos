<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhCalculator, PhCheckCircle, PhClockCountdown, PhWarning, PhXCircle } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useSolicitudesHoraExtraStore } from "@/stores/solicitudesHoraExtra.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_ESTADO_AUTORIZACION, ETIQUETAS_ESTADO_AUTORIZACION, ETIQUETAS_ESTADO_ACREDITACION } from "@/utils/horaExtra.util";
import { formatoFecha } from "@/utils/formato.util";

const solicitudesStore = useSolicitudesHoraExtraStore();
const empleadosStore = useEmpleadosStore();
const usuariosStore = useUsuariosStore();
const { puede } = usePermisos();

const procesandoId = ref(null);

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  if (usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
  solicitudesStore.cargarSolicitudes();
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

async function manejarAprobar(solicitud) {
  procesandoId.value = solicitud._id;
  await solicitudesStore.aprobar(solicitud._id);
  procesandoId.value = null;
}

async function manejarRechazar(solicitud) {
  procesandoId.value = solicitud._id;
  await solicitudesStore.rechazar(solicitud._id);
  procesandoId.value = null;
}

// Modal conciliar
const modalConciliarAbierto = ref(false);
const formularioConciliar = reactive({ empleadoId: "", fecha: "" });

function abrirConciliar() {
  Object.assign(formularioConciliar, { empleadoId: "", fecha: "" });
  solicitudesStore.resultadoConciliacion = undefined;
  modalConciliarAbierto.value = true;
}

function manejarConciliar() {
  solicitudesStore.conciliar(formularioConciliar.empleadoId, formularioConciliar.fecha);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Horas extra</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Solicitudes de los empleados y conciliación contra marcaciones reales.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.HORA_EXTRA, ACCIONES.APROBAR)" ancho="auto" @click="abrirConciliar">
        <PhCalculator class="size-4" weight="bold" />
        Conciliar
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="solicitudesStore.filtros.estadoAutorizacion"
        label="Estado"
        placeholder="Todos"
        class="w-56"
        :opciones="OPCIONES_ESTADO_AUTORIZACION"
        @update:model-value="solicitudesStore.cargarSolicitudes"
      />
      <BaseSelect
        v-model="solicitudesStore.filtros.empleadoId"
        label="Empleado"
        placeholder="Todos"
        class="w-56"
        :opciones="opcionesEmpleados"
        @update:model-value="solicitudesStore.cargarSolicitudes"
      />
    </div>

    <BaseAlerta v-if="solicitudesStore.error" tipo="error" class="mt-6">{{ solicitudesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="solicitudesStore.errorAccion" tipo="error" class="mt-6">{{ solicitudesStore.errorAccion }}</BaseAlerta>

    <p v-if="solicitudesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando solicitudes…</p>

    <div
      v-else-if="solicitudesStore.solicitudes.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhClockCountdown class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay solicitudes con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="solicitud in solicitudesStore.solicitudes" :key="solicitud._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ nombreEmpleado(solicitud.empleadoId) }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">
              {{ ETIQUETAS_ESTADO_AUTORIZACION[solicitud.estadoAutorizacion] }}
            </span>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">
              {{ ETIQUETAS_ESTADO_ACREDITACION[solicitud.estadoAcreditacion] }}
            </span>
            <span v-if="solicitud.alertaIncumplimiento" class="inline-flex items-center gap-1 rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">
              <PhWarning class="size-3" />
              Excede el tope legal
            </span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            {{ formatoFecha(solicitud.fecha) }} · estimadas {{ solicitud.horasEstimadas }}h · acreditadas {{ solicitud.horasAcreditadas }}h
          </p>
          <p v-if="solicitud.estadoAutorizacion === 'pendiente_segunda_aprobacion'" class="mt-1 text-xs text-texto-sutil">
            Primera aprobación: {{ nombreUsuario(solicitud.primerAprobadorId) }} — falta la de otra persona.
          </p>
        </div>
        <div
          v-if="
            (solicitud.estadoAutorizacion === 'pendiente' || solicitud.estadoAutorizacion === 'pendiente_segunda_aprobacion') &&
            puede(MODULOS.HORA_EXTRA, ACCIONES.APROBAR)
          "
          class="flex shrink-0 items-center gap-1.5"
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
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="solicitudesStore.paginacion && solicitudesStore.paginacion.totalPaginas > 1"
      :paginacion="solicitudesStore.paginacion"
      @anterior="solicitudesStore.irAPaginaAnterior"
      @siguiente="solicitudesStore.irAPaginaSiguiente"
    />

    <BaseModal v-model="modalConciliarAbierto" titulo="Conciliar horas extra">
      <p class="mb-5 text-sm text-texto-sutil">
        Compara lo solicitado contra las marcaciones reales de ese día. Si no había solicitud pero sí trabajo suplementario real, se
        registra igual.
      </p>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarConciliar">
        <BaseAlerta v-if="solicitudesStore.errorConciliacion" tipo="error">{{ solicitudesStore.errorConciliacion }}</BaseAlerta>
        <BaseSelect v-model="formularioConciliar.empleadoId" label="Empleado" :opciones="opcionesEmpleados" requerido />
        <BaseInput v-model="formularioConciliar.fecha" type="date" label="Fecha" requerido />
        <BaseBoton tipo="submit" :cargando="solicitudesStore.conciliando" class="mt-1">Conciliar</BaseBoton>
      </form>

      <BaseAlerta v-if="solicitudesStore.resultadoConciliacion === null" tipo="info" class="mt-5">
        Nada que conciliar: no hubo solicitud ni trabajo suplementario real ese día.
      </BaseAlerta>
      <div v-else-if="solicitudesStore.resultadoConciliacion" class="mt-5 rounded-xl border border-borde bg-fondo p-4 text-sm">
        <p class="font-medium text-texto">{{ ETIQUETAS_ESTADO_ACREDITACION[solicitudesStore.resultadoConciliacion.estadoAcreditacion] }}</p>
        <p class="mt-1 text-texto-sutil">
          Estimadas {{ solicitudesStore.resultadoConciliacion.horasEstimadas }}h · acreditadas
          {{ solicitudesStore.resultadoConciliacion.horasAcreditadas }}h
        </p>
        <p v-if="solicitudesStore.resultadoConciliacion.alertaIncumplimiento" class="mt-1 text-error">Excede el tope legal diario.</p>
      </div>
    </BaseModal>
  </div>
</template>
