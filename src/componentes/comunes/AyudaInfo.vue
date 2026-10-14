<script setup>
import { useId } from "vue";
import { PhInfo } from "@phosphor-icons/vue";

defineProps({
  texto: { type: String, required: true },
});

const id = useId();
</script>

<template>
  <span class="group relative inline-flex">
    <button
      type="button"
      class="inline-flex size-5 items-center justify-center rounded-full text-texto-sutil transition-colors hover:text-texto focus-visible:text-texto"
      :aria-describedby="id"
      aria-label="Más información"
    >
      <PhInfo class="size-[18px]" weight="bold" />
    </button>
    <span
      :id="id"
      role="tooltip"
      class="pointer-events-none absolute top-full left-1/2 z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-borde bg-fondo-elevado p-3 text-xs leading-relaxed text-texto opacity-0 shadow-[var(--sombra-panel)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {{ texto }}
    </span>
  </span>
</template>
