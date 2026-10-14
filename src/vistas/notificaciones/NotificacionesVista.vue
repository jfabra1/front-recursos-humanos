<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhBellRinging, PhCheck, PhPlus } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseTextarea from "@/componentes/base/BaseTextarea.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useNotificacionesStore } from "@/stores/notificaciones.store";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_ESTADO_NOTIFICACION, ETIQUETAS_ESTADO_NOTIFICACION, OPCIONES_CANAL_NOTIFICACION, ETIQUETAS_CANAL_NOTIFICACION } from "@/utils/notificacion.util";
import { formatoFechaHora } from "@/utils/formato.util";

const notificacionesStore = useNotificacionesStore();
const usuariosStore = useUsuariosStore();
const { puede } = usePermisos();

const puedeVerTodas = computed(() => puede(MODULOS.NOTIFICACION, ACCIONES.CREAR));
const pestanaActiva = ref("mias");

function nombreUsuario(usuarioId) {
  const usuario = usuariosStore.usuarios.find((item) => item._id === usuarioId);
  return usuario ? `${usuario.email} (${usuario.rolId?.nombre})` : "—";
}

const opcionesUsuarios = computed(() =>
  usuariosStore.usuarios.map((usuario) => ({ valor: usuario._id, texto: `${usuario.email} (${usuario.rolId?.nombre})` })),
);

async function manejarMarcarLeida(notificacion) {
  await notificacionesStore.marcarLeida(notificacion._id);
}

function cambiarPestana(valor) {
  pestanaActiva.value = valor;
  if (valor === "todas" && puedeVerTodas.value) {
    if (usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
    notificacionesStore.cargarTodas();
  }
}

onMounted(() => {
  notificacionesStore.cargarPropias();
});

// Modal crear
const modalCrearAbierto = ref(false);
const formulario = reactive({ destinatarioId: "", tipo: "", canal: "web", titulo: "", mensaje: "" });

function abrirCrear() {
  Object.assign(formulario, { destinatarioId: "", tipo: "", canal: "web", titulo: "", mensaje: "" });
  if (usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
  modalCrearAbierto.value = true;
}

async function manejarCrear() {
  if (await notificacionesStore.crearNotificacion({ ...formulario })) {
    modalCrearAbierto.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Notificaciones</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Tu buzón de avisos del sistema{{ puedeVerTodas ? " y el registro de envíos de toda la empresa." : "." }}</p>
      </div>
      <BaseBoton v-if="puedeVerTodas" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nueva notificación
      </BaseBoton>
    </div>

    <div v-if="puedeVerTodas" class="mt-6 flex gap-1 border-b border-borde">
      <button
        type="button"
        class="border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
        :class="pestanaActiva === 'mias' ? 'border-acento text-acento' : 'border-transparent text-texto-sutil hover:text-texto'"
        @click="cambiarPestana('mias')"
      >
        Mis notificaciones
      </button>
      <button
        type="button"
        class="border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
        :class="pestanaActiva === 'todas' ? 'border-acento text-acento' : 'border-transparent text-texto-sutil hover:text-texto'"
        @click="cambiarPestana('todas')"
      >
        Todas (empresa)
      </button>
    </div>

    <!-- Mis notificaciones -->
    <section v-if="pestanaActiva === 'mias'" class="mt-6">
      <div class="flex flex-wrap items-end gap-3">
        <BaseSelect
          v-model="notificacionesStore.filtrosPropias.estado"
          label="Estado"
          placeholder="Todos"
          class="w-48"
          :opciones="OPCIONES_ESTADO_NOTIFICACION"
          @update:model-value="notificacionesStore.cargarPropias"
        />
      </div>

      <BaseAlerta v-if="notificacionesStore.errorPropias" tipo="error" class="mt-6">{{ notificacionesStore.errorPropias }}</BaseAlerta>
      <BaseAlerta v-if="notificacionesStore.errorAccion" tipo="error" class="mt-6">{{ notificacionesStore.errorAccion }}</BaseAlerta>

      <p v-if="notificacionesStore.cargandoPropias" class="mt-6 text-sm text-texto-sutil">Cargando notificaciones…</p>

      <div
        v-else-if="notificacionesStore.propias.length === 0"
        class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhBellRinging class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">No tienes notificaciones con estos filtros.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li
          v-for="notificacion in notificacionesStore.propias"
          :key="notificacion._id"
          class="flex items-center justify-between gap-4 px-5 py-4"
          :class="notificacion.estado !== 'leida' && 'bg-acento/5'"
        >
          <div>
            <div class="flex items-center gap-2.5">
              <p class="text-sm font-medium text-texto">{{ notificacion.titulo }}</p>
              <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_NOTIFICACION[notificacion.estado] }}</span>
            </div>
            <p class="mt-1 text-sm text-texto-sutil">{{ notificacion.mensaje }}</p>
            <p class="mt-1 text-xs text-texto-sutil">{{ formatoFechaHora(notificacion.createdAt) }}</p>
          </div>
          <button
            v-if="notificacion.estado !== 'leida'"
            type="button"
            class="shrink-0 rounded-lg p-2 text-texto-sutil transition-colors hover:bg-exito/10 hover:text-exito"
            aria-label="Marcar como leída"
            @click="manejarMarcarLeida(notificacion)"
          >
            <PhCheck class="size-5" />
          </button>
        </li>
      </ul>

      <BasePaginacion
        v-if="notificacionesStore.paginacionPropias && notificacionesStore.paginacionPropias.totalPaginas > 1"
        :paginacion="notificacionesStore.paginacionPropias"
        @anterior="notificacionesStore.irAPaginaAnteriorPropias"
        @siguiente="notificacionesStore.irAPaginaSiguientePropias"
      />
    </section>

    <!-- Todas (empresa) -->
    <section v-else-if="pestanaActiva === 'todas'" class="mt-6">
      <div class="flex flex-wrap items-end gap-3">
        <BaseSelect
          v-model="notificacionesStore.filtrosTodas.destinatarioId"
          label="Destinatario"
          placeholder="Todos"
          class="w-64"
          :opciones="opcionesUsuarios"
          @update:model-value="notificacionesStore.cargarTodas"
        />
        <BaseSelect
          v-model="notificacionesStore.filtrosTodas.estado"
          label="Estado"
          placeholder="Todos"
          class="w-48"
          :opciones="OPCIONES_ESTADO_NOTIFICACION"
          @update:model-value="notificacionesStore.cargarTodas"
        />
      </div>

      <BaseAlerta v-if="notificacionesStore.errorTodas" tipo="error" class="mt-6">{{ notificacionesStore.errorTodas }}</BaseAlerta>

      <p v-if="notificacionesStore.cargandoTodas" class="mt-6 text-sm text-texto-sutil">Cargando notificaciones…</p>

      <div
        v-else-if="notificacionesStore.todas.length === 0"
        class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhBellRinging class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">No hay notificaciones con estos filtros.</p>
      </div>

      <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="notificacion in notificacionesStore.todas" :key="notificacion._id" class="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <div class="flex items-center gap-2.5">
              <p class="text-sm font-medium text-texto">{{ notificacion.titulo }}</p>
              <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_CANAL_NOTIFICACION[notificacion.canal] }}</span>
              <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_NOTIFICACION[notificacion.estado] }}</span>
            </div>
            <p class="mt-1 text-sm text-texto-sutil">{{ nombreUsuario(notificacion.destinatarioId) }} · {{ notificacion.mensaje }}</p>
            <p v-if="notificacion.errorEnvio" class="mt-1 text-xs text-error">{{ notificacion.errorEnvio }}</p>
            <p class="mt-1 text-xs text-texto-sutil">{{ formatoFechaHora(notificacion.createdAt) }}</p>
          </div>
        </li>
      </ul>

      <BasePaginacion
        v-if="notificacionesStore.paginacionTodas && notificacionesStore.paginacionTodas.totalPaginas > 1"
        :paginacion="notificacionesStore.paginacionTodas"
        @anterior="notificacionesStore.irAPaginaAnteriorTodas"
        @siguiente="notificacionesStore.irAPaginaSiguienteTodas"
      />
    </section>

    <BaseModal v-model="modalCrearAbierto" titulo="Nueva notificación">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarCrear">
        <BaseAlerta v-if="notificacionesStore.errorGuardado" tipo="error">{{ notificacionesStore.errorGuardado }}</BaseAlerta>
        <BaseSelect v-model="formulario.destinatarioId" label="Destinatario" :opciones="opcionesUsuarios" requerido />
        <BaseSelect v-model="formulario.canal" label="Canal" :opciones="OPCIONES_CANAL_NOTIFICACION" requerido />
        <BaseInput v-model="formulario.tipo" label="Tipo" placeholder="aviso_manual" requerido />
        <BaseInput v-model="formulario.titulo" label="Título" requerido />
        <BaseTextarea v-model="formulario.mensaje" label="Mensaje" requerido />
        <BaseBoton tipo="submit" :cargando="notificacionesStore.guardando" class="mt-1">Enviar</BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
