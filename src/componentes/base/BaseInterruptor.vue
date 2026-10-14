<script setup>
import { useId } from "vue";

const modelo = defineModel({ type: Boolean, default: false });

const props = defineProps({
  label: { type: String, required: true },
  descripcion: { type: String, default: "" },
  deshabilitado: { type: Boolean, default: false },
});

const id = useId();
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <div>
      <label :for="id" class="text-sm font-medium text-texto">{{ label }}</label>
      <p v-if="descripcion" class="mt-0.5 text-xs text-texto-sutil">{{ descripcion }}</p>
    </div>
    <button
      :id="id"
      type="button"
      role="switch"
      :aria-checked="modelo"
      :disabled="deshabilitado"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60"
      :class="modelo ? 'bg-acento' : 'bg-borde-fuerte'"
      @click="!deshabilitado && (modelo = !modelo)"
    >
      <span
        class="inline-block size-4 translate-x-1 rounded-full bg-fondo-elevado shadow transition-transform duration-150"
        :class="modelo && 'translate-x-6'"
      />
    </button>
  </div>
</template>
