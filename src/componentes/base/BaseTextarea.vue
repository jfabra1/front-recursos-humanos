<script setup>
import { useId } from "vue";

const modelo = defineModel({ type: String, default: "" });

const props = defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: "" },
  error: { type: String, default: "" },
  requerido: { type: Boolean, default: false },
  filas: { type: Number, default: 4 },
  maxLongitud: { type: Number, default: undefined },
});

const id = useId();
const idError = `${id}-error`;
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-texto">
      {{ label }}<span v-if="requerido" class="text-error"> *</span>
    </label>

    <textarea
      :id="id"
      v-model="modelo"
      :rows="filas"
      :placeholder="placeholder"
      :required="requerido"
      :maxlength="maxLongitud"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? idError : undefined"
      class="w-full resize-y rounded-xl border bg-fondo-elevado px-3.5 py-2.5 text-sm text-texto placeholder:text-texto-sutil transition-colors duration-150 focus-visible:border-acento"
      :class="error ? 'border-error' : 'border-borde-fuerte'"
    />

    <p v-if="error" :id="idError" class="text-sm text-error">{{ error }}</p>
  </div>
</template>
