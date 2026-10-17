<script setup>
import { watch, useTemplateRef } from "vue";
import { PhX } from "@phosphor-icons/vue";

const abierto = defineModel({ type: Boolean, default: false });
const props = defineProps({
  titulo: { type: String, required: true },
  // "md" (default, el de siempre) | "lg" | "xl" — para formularios que necesitan más ancho
  // (ej. un editor de texto enriquecido). No cambia nada existente si no se pasa.
  ancho: { type: String, default: "md" },
});

const CLASES_ANCHO = { md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };

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
    class="m-auto w-full rounded-2xl border border-borde bg-fondo-elevado p-0 text-texto shadow-[var(--sombra-panel)] backdrop:bg-texto/30 backdrop:backdrop-blur-sm"
    :class="CLASES_ANCHO[props.ancho]"
    @close="abierto = false"
    @cancel="abierto = false"
    @click="(evento) => evento.target === dialogo && cerrar()"
  >
    <div class="flex items-center justify-between border-b border-borde px-6 py-4">
      <h2 class="text-base font-semibold text-texto">{{ titulo }}</h2>
      <button type="button" class="text-texto-sutil transition-colors hover:text-texto" aria-label="Cerrar" title="Cerrar" @click="cerrar">
        <PhX class="size-[18px]" />
      </button>
    </div>
    <div class="px-6 py-5">
      <slot :cerrar="cerrar" />
    </div>
  </dialog>
</template>
