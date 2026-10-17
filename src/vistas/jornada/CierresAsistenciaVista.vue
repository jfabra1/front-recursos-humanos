<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { PhCalculator, PhClipboardText, PhPlus } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import SelectorSede from "@/componentes/comunes/SelectorSede.vue";
import { useCierresAsistenciaStore } from "@/stores/cierresAsistencia.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { ETIQUETAS_ESTADO_CIERRE, siguienteEstadoCierre } from "@/utils/jornada.util";

const cierresStore = useCierresAsistenciaStore();
const empleadosStore = useEmpleadosStore();
const { puede } = usePermisos();

const sedeSeleccionada = ref("");

onMounted(() => {
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
});

watch(sedeSeleccionada, (sedeSlug) => {
  if (sedeSlug) cierresStore.cargarCierres(sedeSlug);
});

function nombreEmpleado(empleadoId) {
  const empleado = empleadosStore.empleados.find((item) => item._id === empleadoId);
  return empleado ? `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` : "—";
}
function formatoFechaHora(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

// Modal crear
const modalCrearAbierto = ref(false);
const formularioCrear = reactive({ periodoInicio: "", periodoFin: "" });

function abrirCrear() {
  Object.assign(formularioCrear, { periodoInicio: "", periodoFin: "" });
  modalCrearAbierto.value = true;
}

async function manejarCrear() {
  if (await cierresStore.crearCierre({ ...formularioCrear })) modalCrearAbierto.value = false;
}

// Modal detalle
const modalDetalleAbierto = ref(false);
const cierreIdSeleccionado = ref(null);
const cierreSeleccionado = ref(null);

watch(
  () => cierresStore.cierres,
  (cierres) => {
    if (cierreIdSeleccionado.value) cierreSeleccionado.value = cierres.find((c) => c._id === cierreIdSeleccionado.value) || null;
  },
  { deep: true },
);

function abrirDetalle(cierre) {
  cierreIdSeleccionado.value = cierre._id;
  cierreSeleccionado.value = cierre;
  modalDetalleAbierto.value = true;
}

async function manejarCalcularTotales() {
  await cierresStore.calcularTotales(cierreIdSeleccionado.value);
}

async function manejarAvanzar() {
  const siguiente = siguienteEstadoCierre(cierreSeleccionado.value.estado);
  if (siguiente) await cierresStore.avanzarEstado(cierreIdSeleccionado.value, siguiente);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Cierres de asistencia</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Períodos de cierre, con cálculo de horas diurnas/nocturnas por empleado.</p>
      </div>
      <BaseBoton v-if="sedeSeleccionada && puede(MODULOS.CIERRE_ASISTENCIA, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nuevo cierre
      </BaseBoton>
    </div>

    <div class="mt-6 max-w-xs">
      <SelectorSede v-model="sedeSeleccionada" />
    </div>

    <BaseAlerta v-if="!sedeSeleccionada" tipo="info" class="mt-6">Selecciona una sede para ver sus cierres.</BaseAlerta>

    <template v-else>
      <BaseAlerta v-if="cierresStore.error" tipo="error" class="mt-6">{{ cierresStore.error }}</BaseAlerta>

      <p v-if="cierresStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando cierres…</p>

      <div
        v-else-if="cierresStore.cierres.length === 0"
        class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhClipboardText class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">Esta sede no tiene cierres registrados.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li
          v-for="cierre in cierresStore.cierres"
          :key="cierre._id"
          class="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-fondo"
          @click="abrirDetalle(cierre)"
        >
          <div>
            <p class="text-sm font-medium text-texto">{{ formatoFechaHora(cierre.periodoInicio) }} – {{ formatoFechaHora(cierre.periodoFin) }}</p>
            <p v-if="cierre.totales" class="mt-0.5 text-xs text-texto-sutil">
              {{ cierre.totales.totalMarcaciones }} marcaciones · {{ cierre.totales.incidenciasAbiertas }} incidencias abiertas
            </p>
          </div>
          <span class="rounded-full bg-acento/10 px-2.5 py-1 text-xs font-medium text-acento">{{ ETIQUETAS_ESTADO_CIERRE[cierre.estado] }}</span>
        </li>
      </ul>

      <BasePaginacion
        v-if="cierresStore.paginacion"
        :paginacion="cierresStore.paginacion"
        :limite="cierresStore.limite"
        @anterior="cierresStore.irAPaginaAnterior"
        @siguiente="cierresStore.irAPaginaSiguiente"
        @cambiar-limite="cierresStore.cambiarLimite"
      />
    </template>

    <BaseModal v-model="modalCrearAbierto" titulo="Nuevo cierre">
      <BaseAlerta v-if="cierresStore.errorGuardado" tipo="error" class="mb-5">{{ cierresStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarCrear">
        <BaseInput v-model="formularioCrear.periodoInicio" type="datetime-local" label="Inicio del período" requerido />
        <BaseInput v-model="formularioCrear.periodoFin" type="datetime-local" label="Fin del período" requerido />
        <BaseBoton tipo="submit" :cargando="cierresStore.guardando" class="mt-2">Crear cierre</BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalDetalleAbierto" titulo="Detalle del cierre">
      <template v-if="cierreSeleccionado">
        <BaseAlerta v-if="cierresStore.errorAccion" tipo="error" class="mb-5">{{ cierresStore.errorAccion }}</BaseAlerta>

        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-texto">
            {{ formatoFechaHora(cierreSeleccionado.periodoInicio) }} – {{ formatoFechaHora(cierreSeleccionado.periodoFin) }}
          </p>
          <span class="rounded-full bg-acento/10 px-2.5 py-1 text-xs font-medium text-acento">{{ ETIQUETAS_ESTADO_CIERRE[cierreSeleccionado.estado] }}</span>
        </div>

        <div v-if="cierreSeleccionado.totales" class="mt-5 rounded-xl border border-borde bg-fondo p-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-texto-sutil">Marcaciones</p>
              <p class="mt-0.5 font-medium text-texto">{{ cierreSeleccionado.totales.totalMarcaciones }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Incidencias abiertas</p>
              <p class="mt-0.5 font-medium text-texto">{{ cierreSeleccionado.totales.incidenciasAbiertas }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Horas diurnas</p>
              <p class="mt-0.5 font-medium text-texto">{{ cierreSeleccionado.totales.totalHorasDiurnas }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Horas nocturnas</p>
              <p class="mt-0.5 font-medium text-texto">{{ cierreSeleccionado.totales.totalHorasNocturnas }}</p>
            </div>
          </div>

          <ul v-if="cierreSeleccionado.totales.resumenPorEmpleado?.length" class="mt-4 flex flex-col divide-y divide-borde border-t border-borde">
            <li
              v-for="fila in cierreSeleccionado.totales.resumenPorEmpleado"
              :key="fila.empleadoId"
              class="flex items-center justify-between py-2.5 text-xs"
            >
              <span class="text-texto">{{ nombreEmpleado(fila.empleadoId) }}</span>
              <span class="text-texto-sutil">{{ fila.horasDiurnas }}h diurnas · {{ fila.horasNocturnas }}h nocturnas</span>
            </li>
          </ul>

          <p class="mt-4 text-xs text-texto-sutil">
            Solo diurno/nocturno — festivos, dominicales y valores monetarios no se calculan aquí todavía (pendiente de validación legal).
          </p>
        </div>
        <BaseAlerta v-else tipo="info" class="mt-5">Todavía no se han calculado los totales de este cierre.</BaseAlerta>

        <div class="mt-5 flex flex-col gap-3">
          <BaseBoton
            v-if="puede(MODULOS.CIERRE_ASISTENCIA, ACCIONES.CREAR)"
            variante="secundario"
            :cargando="cierresStore.procesando"
            @click="manejarCalcularTotales"
          >
            <PhCalculator class="size-4" />
            Calcular totales
          </BaseBoton>
          <BaseBoton
            v-if="siguienteEstadoCierre(cierreSeleccionado.estado) && puede(MODULOS.CIERRE_ASISTENCIA, ACCIONES.APROBAR)"
            :cargando="cierresStore.procesando"
            @click="manejarAvanzar"
          >
            Avanzar a {{ ETIQUETAS_ESTADO_CIERRE[siguienteEstadoCierre(cierreSeleccionado.estado)] }}
          </BaseBoton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
