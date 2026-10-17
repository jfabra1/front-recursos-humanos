<script setup>
import { computed, onMounted, ref } from "vue";
import { PhCheckCircle, PhClipboardText, PhXCircle } from "@phosphor-icons/vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useSolicitudesPermisoStore } from "@/stores/solicitudesPermiso.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_PERMISO, ETIQUETAS_TIPO_PERMISO, OPCIONES_ESTADO_PERMISO, ETIQUETAS_ESTADO_PERMISO } from "@/utils/solicitudPermiso.util";
import { formatoFecha } from "@/utils/formato.util";

const solicitudesStore = useSolicitudesPermisoStore();
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
</script>

<template>
  <div>
    <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
      Permisos y licencias
      <AyudaInfo
        texto="Permisos generales y licencias especiales (maternidad, paternidad, luto, calamidad doméstica) que el empleado solicita desde su autogestión."
      />
    </h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Solicitudes de permisos y licencias especiales de los empleados.</p>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="solicitudesStore.filtros.tipo"
        label="Tipo"
        placeholder="Todos"
        class="w-56"
        :opciones="OPCIONES_TIPO_PERMISO"
        @update:model-value="solicitudesStore.cargarSolicitudes"
      />
      <BaseSelect
        v-model="solicitudesStore.filtros.estado"
        label="Estado"
        placeholder="Todos"
        class="w-48"
        :opciones="OPCIONES_ESTADO_PERMISO"
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
      <PhClipboardText class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay solicitudes con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="solicitud in solicitudesStore.solicitudes" :key="solicitud._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ nombreEmpleado(solicitud.empleadoId) }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_TIPO_PERMISO[solicitud.tipo] }}</span>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_PERMISO[solicitud.estado] }}</span>
            <span v-if="!solicitud.remunerado" class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">No remunerado</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">{{ formatoFecha(solicitud.fechaInicio) }} – {{ formatoFecha(solicitud.fechaFin) }}</p>
          <p v-if="solicitud.estado === 'pendiente_segunda_aprobacion'" class="mt-1 text-xs text-texto-sutil">
            Primera aprobación: {{ nombreUsuario(solicitud.primerAprobadorId) }} — falta la de otra persona.
          </p>
        </div>
        <div
          v-if="
            (solicitud.estado === 'pendiente' || solicitud.estado === 'pendiente_segunda_aprobacion') &&
            puede(MODULOS.PERMISO, ACCIONES.APROBAR)
          "
          class="flex shrink-0 items-center gap-1.5"
        >
          <button
            type="button"
            :disabled="procesandoId === solicitud._id"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error disabled:opacity-50"
            aria-label="Rechazar"
            title="Rechazar"
            @click="manejarRechazar(solicitud)"
          >
            <PhXCircle class="size-5" />
          </button>
          <button
            type="button"
            :disabled="procesandoId === solicitud._id"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-exito/10 hover:text-exito disabled:opacity-50"
            aria-label="Aprobar"
            title="Aprobar"
            @click="manejarAprobar(solicitud)"
          >
            <PhCheckCircle class="size-5" />
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="solicitudesStore.paginacion"
      :paginacion="solicitudesStore.paginacion"
      :limite="solicitudesStore.limite"
      @anterior="solicitudesStore.irAPaginaAnterior"
      @siguiente="solicitudesStore.irAPaginaSiguiente"
      @cambiar-limite="solicitudesStore.cambiarLimite"
    />
  </div>
</template>
