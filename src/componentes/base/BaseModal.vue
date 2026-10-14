<script setup>
import { watch, useTemplateRef } from "vue";
import { PhX } from "@phosphor-icons/vue";

const abierto = defineModel({ type: Boolean, default: false });
defineProps({ titulo: { type: String, required: true } });

const dialogo = useTemplateRef("dialogo");

watch(abierto, (valor) => {
  if (!dialogo.value) return;
  if (valor && !dialogo.value.open) dialogo.value.showModal();
  if (!valor && dialogo.value.open) dialogo.value.close();
});

function cerrar() {
  abierto.value = false;
}
</script>

<template>
  <dialog
    ref="dialogo"
    class="m-auto w-full max-w-md rounded-2xl border border-borde bg-fondo-elevado p-0 text-texto shadow-[var(--sombra-panel)] backdrop:bg-texto/30 backdrop:backdrop-blur-sm"
    @close="abierto = false"
    @cancel="abierto = false"
    @click="(evento) => evento.target === dialogo && cerrar()"
  >
    <div class="flex items-center justify-between border-b border-borde px-6 py-4">
      <h2 class="text-base font-semibold text-texto">{{ titulo }}</h2>
      <button type="button" class="text-texto-sutil transition-colors hover:text-texto" aria-label="Cerrar" @click="cerrar">
        <PhX class="size-[18px]" />
      </button>
    </div>
    <div class="px-6 py-5">
      <slot :cerrar="cerrar" />
    </div>
  </dialog>
</template>
