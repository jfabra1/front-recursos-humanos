<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { PhArrowsClockwise, PhCalendarCheck, PhPlus, PhProhibit } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import SelectorSede from "@/componentes/comunes/SelectorSede.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useAsignacionHorarioStore } from "@/stores/asignacionHorario.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useHorariosStore } from "@/stores/horarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { formatoFecha } from "@/utils/formato.util";

const asignacionesStore = useAsignacionHorarioStore();
const empleadosStore = useEmpleadosStore();
const horariosStore = useHorariosStore();
const { puede } = usePermisos();

const sedeSeleccionada = ref("");

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  if (horariosStore.horarios.length === 0) horariosStore.cargarHorarios();
});

watch(sedeSeleccionada, (sedeSlug) => {
  if (sedeSlug) asignacionesStore.cargarAsignaciones(sedeSlug);
});

const opcionesEmpleados = computed(() =>
  empleadosStore.empleados.map((empleado) => ({ valor: empleado._id, texto: `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` })),
);
const opcionesHorarios = computed(() => horariosStore.horarios.filter((h) => h.activo).map((h) => ({ valor: h._id, texto: h.nombre })));

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}
function nombreHorario(horarioId) {
  return horariosStore.horarios.find((h) => h._id === horarioId)?.nombre || "—";
}

const modalAbierto = ref(false);
const formulario = reactive({ empleadoId: "", horarioId: "", fechaDesde: "", fechaHasta: "", desplazamientoMinutos: "", ajusteDescansoMinutos: "" });

function abrirCrear() {
  Object.assign(formulario, { empleadoId: "", horarioId: "", fechaDesde: "", fechaHasta: "", desplazamientoMinutos: "", ajusteDescansoMinutos: "" });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  const datos = {
    empleadoId: formulario.empleadoId,
    horarioId: formulario.horarioId,
    fechaDesde: formulario.fechaDesde,
    ...(formulario.fechaHasta ? { fechaHasta: formulario.fechaHasta } : {}),
    ...(formulario.desplazamientoMinutos ? { desplazamientoMinutos: Number(formulario.desplazamientoMinutos) } : {}),
    ...(formulario.ajusteDescansoMinutos ? { ajusteDescansoMinutos: Number(formulario.ajusteDescansoMinutos) } : {}),
  };
  if (await asignacionesStore.crearAsignacion(datos)) modalAbierto.value = false;
}

const confirmandoId = ref(null);

function manejarAnular(asignacion) {
  if (confirmandoId.value !== asignacion._id) {
    confirmandoId.value = asignacion._id;
    setTimeout(() => {
      if (confirmandoId.value === asignacion._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  asignacionesStore.anularAsignacion(asignacion._id);
}

function manejarGenerarTurnos(asignacion) {
  asignacionesStore.generarTurnos(asignacion._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
          Asignación de horarios
          <AyudaInfo texto="Vínculo recurrente: 'este empleado usa este horario desde tal fecha'. A diferencia de un Turno (un solo día), esto se convierte en Turnos reales con el botón 'Generar turnos'." />
        </h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Asigna un horario fijo a un empleado y genera sus turnos automáticamente.</p>
      </div>
      <BaseBoton v-if="sedeSeleccionada && puede(MODULOS.TURNO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nueva asignación
      </BaseBoton>
    </div>

    <div class="mt-6 max-w-xs">
      <SelectorSede v-model="sedeSeleccionada" />
    </div>

    <BaseAlerta v-if="!sedeSeleccionada" tipo="info" class="mt-6">Selecciona una sede para ver sus asignaciones.</BaseAlerta>

    <template v-else>
      <BaseAlerta v-if="asignacionesStore.error" tipo="error" class="mt-6">{{ asignacionesStore.error }}</BaseAlerta>
      <BaseAlerta v-if="asignacionesStore.errorAccion" tipo="error" class="mt-6">{{ asignacionesStore.errorAccion }}</BaseAlerta>
      <BaseAlerta v-if="asignacionesStore.errorGenerar" tipo="error" class="mt-6">{{ asignacionesStore.errorGenerar }}</BaseAlerta>

      <p v-if="asignacionesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando asignaciones…</p>

      <div
        v-else-if="asignacionesStore.asignaciones.length === 0"
        class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhCalendarCheck class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">Esta sede no tiene asignaciones de horario registradas.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="asignacion in asignacionesStore.asignaciones" :key="asignacion._id" class="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <div class="flex items-center gap-2.5">
              <p class="text-sm font-medium text-texto">{{ nombreEmpleado(asignacion.empleadoId) }}</p>
              <span v-if="!asignacion.activa" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactiva</span>
            </div>
            <p class="mt-0.5 text-xs text-texto-sutil">
              {{ nombreHorario(asignacion.horarioId) }} · Desde {{ formatoFecha(asignacion.fechaDesde) }} ·
              {{ asignacion.fechaHasta ? `Hasta ${formatoFecha(asignacion.fechaHasta)}` : "Indefinido" }}
              <template v-if="asignacion.desplazamientoMinutos">· Desplazamiento {{ asignacion.desplazamientoMinutos }} min</template>
              <template v-if="asignacion.ajusteDescansoMinutos">· Ajuste descanso {{ asignacion.ajusteDescansoMinutos }} min</template>
            </p>
            <p
              v-if="asignacionesStore.resultadoGenerar?.asignacionId === asignacion._id"
              class="mt-1 text-xs text-exito"
            >
              {{ asignacionesStore.resultadoGenerar.creados }} turnos generados ({{ asignacionesStore.resultadoGenerar.saltados }} ya existían) hasta
              {{ formatoFecha(asignacionesStore.resultadoGenerar.generadoHasta) }}.
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            <button
              v-if="asignacion.activa && puede(MODULOS.TURNO, ACCIONES.CREAR)"
              type="button"
              class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
              aria-label="Generar turnos"
              title="Generar turnos"
              :disabled="asignacionesStore.generandoId === asignacion._id"
              @click="manejarGenerarTurnos(asignacion)"
            >
              <PhArrowsClockwise class="size-[18px]" :class="{ 'animate-spin': asignacionesStore.generandoId === asignacion._id }" />
            </button>
            <button
              v-if="asignacion.activa && puede(MODULOS.TURNO, ACCIONES.EDITAR)"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="confirmandoId === asignacion._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
              @click="manejarAnular(asignacion)"
            >
              <span class="inline-flex items-center gap-1.5">
                <PhProhibit class="size-[14px]" />
                {{ confirmandoId === asignacion._id ? "¿Confirmar?" : "Desactivar" }}
              </span>
            </button>
          </div>
        </li>
      </ul>

      <BasePaginacion
        v-if="asignacionesStore.paginacion"
        :paginacion="asignacionesStore.paginacion"
        :limite="asignacionesStore.limite"
        @anterior="asignacionesStore.irAPaginaAnterior"
        @siguiente="asignacionesStore.irAPaginaSiguiente"
        @cambiar-limite="asignacionesStore.cambiarLimite"
      />
    </template>

    <BaseModal v-model="modalAbierto" titulo="Nueva asignación de horario">
      <BaseAlerta v-if="asignacionesStore.errorGuardado" tipo="error" class="mb-5">{{ asignacionesStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseSelect v-model="formulario.empleadoId" label="Empleado" :opciones="opcionesEmpleados" requerido />
        <BaseSelect v-model="formulario.horarioId" label="Horario" :opciones="opcionesHorarios" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.fechaDesde" type="date" label="Desde" requerido />
          <BaseInput v-model="formulario.fechaHasta" type="date" label="Hasta (opcional)" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.desplazamientoMinutos" type="number" label="Desplazamiento (min, opcional)" placeholder="Ej. 60" />
          <BaseInput v-model="formulario.ajusteDescansoMinutos" type="number" label="Ajuste descanso (min, opcional)" placeholder="Ej. -20" />
        </div>
        <p class="-mt-2 text-xs text-texto-sutil">Desplazamiento: entra/sale esa cantidad de minutos más tarde. Ajuste descanso: negativo acorta su descanso, positivo lo alarga.</p>
        <BaseBoton tipo="submit" :cargando="asignacionesStore.guardando" class="mt-2">Crear asignación</BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
