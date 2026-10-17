<script setup>
import { onMounted } from "vue";
import { PhClipboardText } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useAuditoriaStore } from "@/stores/auditoria.store";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { ETIQUETAS_ACCION_AUDITORIA } from "@/utils/auditoria.util";
import { formatoFechaHora } from "@/utils/formato.util";

const auditoriaStore = useAuditoriaStore();
const usuariosStore = useUsuariosStore();

onMounted(() => {
  if (usuariosStore.usuarios.length === 0) usuariosStore.cargarUsuarios();
  auditoriaStore.cargarRegistros();
});

function nombreUsuario(registro) {
  const usuario = usuariosStore.usuarios.find((item) => item._id === registro.usuarioId);
  return usuario?.email || "Sistema";
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Auditoría</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Registro de cambios sensibles en la empresa. Solo lectura.</p>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput v-model="auditoriaStore.filtros.entidad" label="Entidad" placeholder="Empleado, Contrato…" class="w-48" />
      <BaseSelect
        v-model="auditoriaStore.filtros.accion"
        label="Acción"
        placeholder="Todas"
        class="w-48"
        :opciones="[
          { valor: 'creacion', texto: 'Creación' },
          { valor: 'actualizacion', texto: 'Actualización' },
          { valor: 'anulacion', texto: 'Anulación' },
          { valor: 'cambio_estado', texto: 'Cambio de estado' },
        ]"
      />
      <BaseBoton ancho="auto" @click="auditoriaStore.cargarRegistros">Filtrar</BaseBoton>
    </div>

    <BaseAlerta v-if="auditoriaStore.error" tipo="error" class="mt-6">{{ auditoriaStore.error }}</BaseAlerta>

    <p v-if="auditoriaStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando…</p>

    <div
      v-else-if="auditoriaStore.registros.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhClipboardText class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay registros con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="registro in auditoriaStore.registros" :key="registro._id" class="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_ACCION_AUDITORIA[registro.accion] }}</span>
            <p class="text-sm font-medium text-texto">{{ registro.entidad }}</p>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">{{ registro.detalle }}</p>
          <p class="mt-1 text-xs text-texto-sutil">{{ nombreUsuario(registro) }} · {{ formatoFechaHora(registro.createdAt) }}</p>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="auditoriaStore.paginacion"
      :paginacion="auditoriaStore.paginacion"
      :limite="auditoriaStore.limite"
      @anterior="auditoriaStore.irAPaginaAnterior"
      @siguiente="auditoriaStore.irAPaginaSiguiente"
      @cambiar-limite="auditoriaStore.cambiarLimite"
    />
  </div>
</template>
