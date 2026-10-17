<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { PhCalendarCheck, PhEye, PhPencilSimple, PhPlus, PhProhibit } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import SelectorSede from "@/componentes/comunes/SelectorSede.vue";
import { useTurnosStore } from "@/stores/turnos.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useHorariosStore } from "@/stores/horarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { formatoFecha } from "@/utils/formato.util";

const turnosStore = useTurnosStore();
const empleadosStore = useEmpleadosStore();
const horariosStore = useHorariosStore();
const { puede } = usePermisos();

const sedeSeleccionada = ref("");

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
  if (horariosStore.horarios.length === 0) horariosStore.cargarHorarios();
});

watch(sedeSeleccionada, (sedeSlug) => {
  if (sedeSlug) turnosStore.cargarResumen(sedeSlug);
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
function formatoFechaHora(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

// Detalle por empleado — se abre desde "Ver detalle" en el resumen, reutiliza el mismo listado
// paginado de turnos de siempre (turnosStore.turnos/cargarTurnos), solo que acotado a un empleado.
const modalDetalleAbierto = ref(false);
const empleadoDetalleId = ref(null);

function abrirDetalle(empleadoId) {
  empleadoDetalleId.value = empleadoId;
  turnosStore.cargarTurnos(sedeSeleccionada.value, { empleadoId });
  modalDetalleAbierto.value = true;
}

const modalAbierto = ref(false);
const turnoEditando = ref(null);
const confirmandoId = ref(null);
const formulario = reactive({ empleadoId: "", horarioId: "", fecha: "", horaInicioEsperada: "", horaFinEsperada: "" });

function abrirCrear(empleadoId) {
  turnoEditando.value = null;
  Object.assign(formulario, { empleadoId: empleadoId || "", horarioId: "", fecha: "", horaInicioEsperada: "", horaFinEsperada: "" });
  modalAbierto.value = true;
}

function abrirEditar(turno) {
  turnoEditando.value = turno;
  Object.assign(formulario, {
    empleadoId: turno.empleadoId,
    horarioId: turno.horarioId,
    fecha: turno.fecha?.slice(0, 10) || "",
    horaInicioEsperada: turno.horaInicioEsperada?.slice(0, 16) || "",
    horaFinEsperada: turno.horaFinEsperada?.slice(0, 16) || "",
  });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  if (turnoEditando.value) {
    const datos = {
      horarioId: formulario.horarioId,
      horaInicioEsperada: formulario.horaInicioEsperada,
      horaFinEsperada: formulario.horaFinEsperada,
    };
    if (await turnosStore.actualizarTurno(turnoEditando.value._id, datos)) modalAbierto.value = false;
    return;
  }

  const datos = {
    empleadoId: formulario.empleadoId,
    horarioId: formulario.horarioId,
    fecha: formulario.fecha,
    horaInicioEsperada: formulario.horaInicioEsperada,
    horaFinEsperada: formulario.horaFinEsperada,
  };
  if (await turnosStore.crearTurno(datos)) modalAbierto.value = false;
}

function manejarAnular(turno) {
  if (confirmandoId.value !== turno._id) {
    confirmandoId.value = turno._id;
    setTimeout(() => {
      if (confirmandoId.value === turno._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  turnosStore.anularTurno(turno._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Turnos</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Asignación de horarios a empleados, por sede.</p>
      </div>
      <BaseBoton v-if="sedeSeleccionada && puede(MODULOS.TURNO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear()">
        <PhPlus class="size-4" weight="bold" />
        Nuevo turno
      </BaseBoton>
    </div>

    <div class="mt-6 max-w-xs">
      <SelectorSede v-model="sedeSeleccionada" />
    </div>

    <BaseAlerta v-if="!sedeSeleccionada" tipo="info" class="mt-6">Selecciona una sede para ver sus turnos.</BaseAlerta>

    <template v-else>
      <BaseAlerta v-if="turnosStore.errorResumen" tipo="error" class="mt-6">{{ turnosStore.errorResumen }}</BaseAlerta>

      <p v-if="turnosStore.cargandoResumen" class="mt-8 text-sm text-texto-sutil">Cargando…</p>

      <div
        v-else-if="turnosStore.resumen.length === 0"
        class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhCalendarCheck class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">Esta sede no tiene turnos registrados.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="item in turnosStore.resumen" :key="item.empleadoId" class="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p class="text-sm font-medium text-texto">{{ nombreEmpleado(item.empleadoId) }}</p>
            <p class="mt-0.5 text-xs text-texto-sutil">
              {{ nombreHorario(item.horarioMasRecienteId) }} · {{ item.cantidadTurnos }} turno{{ item.cantidadTurnos === 1 ? "" : "s" }} ·
              {{ formatoFecha(item.primeraFecha) }} – {{ formatoFecha(item.ultimaFecha) }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-acento transition-colors hover:bg-acento/10"
            aria-label="Ver detalle"
            title="Ver detalle"
            @click="abrirDetalle(item.empleadoId)"
          >
            <PhEye class="size-4" />
            Ver detalle
          </button>
        </li>
      </ul>

      <BasePaginacion
        v-if="turnosStore.paginacionResumen"
        :paginacion="turnosStore.paginacionResumen"
        :limite="turnosStore.limiteResumen"
        @anterior="turnosStore.irAPaginaAnteriorResumen"
        @siguiente="turnosStore.irAPaginaSiguienteResumen"
        @cambiar-limite="turnosStore.cambiarLimiteResumen"
      />
    </template>

    <BaseModal v-model="modalDetalleAbierto" :titulo="`Turnos de ${nombreEmpleado(empleadoDetalleId)}`" ancho="lg">
      <div class="flex items-center justify-end">
        <BaseBoton v-if="puede(MODULOS.TURNO, ACCIONES.CREAR)" ancho="auto" variante="secundario" @click="abrirCrear(empleadoDetalleId)">
          <PhPlus class="size-4" weight="bold" />
          Nuevo turno para este empleado
        </BaseBoton>
      </div>

      <BaseAlerta v-if="turnosStore.error" tipo="error" class="mt-4">{{ turnosStore.error }}</BaseAlerta>
      <BaseAlerta v-if="turnosStore.errorAccion" tipo="error" class="mt-4">{{ turnosStore.errorAccion }}</BaseAlerta>

      <p v-if="turnosStore.cargando" class="mt-6 text-sm text-texto-sutil">Cargando turnos…</p>

      <div
        v-else-if="turnosStore.turnos.length === 0"
        class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhCalendarCheck class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">Este empleado no tiene turnos registrados.</p>
      </div>

      <ul v-else class="mt-4 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="turno in turnosStore.turnos" :key="turno._id" class="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p class="text-sm font-medium text-texto">{{ nombreHorario(turno.horarioId) }}</p>
            <p class="mt-0.5 text-xs text-texto-sutil">
              {{ formatoFecha(turno.fecha) }} · {{ formatoFechaHora(turno.horaInicioEsperada) }} – {{ formatoFechaHora(turno.horaFinEsperada) }}
            </p>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              v-if="puede(MODULOS.TURNO, ACCIONES.EDITAR)"
              type="button"
              class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
              aria-label="Editar"
              title="Editar"
              @click="abrirEditar(turno)"
            >
              <PhPencilSimple class="size-[18px]" />
            </button>
            <button
              v-if="puede(MODULOS.TURNO, ACCIONES.ELIMINAR)"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="confirmandoId === turno._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
              @click="manejarAnular(turno)"
            >
              <span class="inline-flex items-center gap-1.5">
                <PhProhibit class="size-[14px]" />
                {{ confirmandoId === turno._id ? "¿Confirmar?" : "Eliminar" }}
              </span>
            </button>
          </div>
        </li>
      </ul>

      <BasePaginacion
        v-if="turnosStore.paginacion"
        :paginacion="turnosStore.paginacion"
        :limite="turnosStore.limite"
        class="mt-4"
        @anterior="turnosStore.irAPaginaAnterior"
        @siguiente="turnosStore.irAPaginaSiguiente"
        @cambiar-limite="turnosStore.cambiarLimite"
      />
    </BaseModal>

    <BaseModal v-model="modalAbierto" :titulo="turnoEditando ? 'Editar turno' : 'Nuevo turno'">
      <BaseAlerta v-if="turnosStore.errorGuardado" tipo="error" class="mb-5">{{ turnosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseSelect
          v-if="!turnoEditando"
          v-model="formulario.empleadoId"
          label="Empleado"
          :opciones="opcionesEmpleados"
          requerido
        />
        <BaseSelect v-model="formulario.horarioId" label="Horario" :opciones="opcionesHorarios" requerido />
        <BaseInput v-if="!turnoEditando" v-model="formulario.fecha" type="date" label="Fecha" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.horaInicioEsperada" type="datetime-local" label="Inicio esperado" requerido />
          <BaseInput v-model="formulario.horaFinEsperada" type="datetime-local" label="Fin esperado" requerido />
        </div>
        <BaseBoton tipo="submit" :cargando="turnosStore.guardando" class="mt-2">
          {{ turnoEditando ? "Guardar cambios" : "Crear turno" }}
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
