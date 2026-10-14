<script setup>
import { useId } from "vue";
import { PhCaretDown } from "@phosphor-icons/vue";

const modelo = defineModel({ type: String, default: "" });

defineProps({
  label: { type: String, required: true },
  opciones: { type: Array, required: true }, // [{ valor, texto }]
  placeholder: { type: String, default: "Selecciona una opción" },
  error: { type: String, default: "" },
  requerido: { type: Boolean, default: false },
});

const id = useId();
const idError = `${id}-error`;
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-texto">
      {{ label }}<span v-if="requerido" class="text-error"> *</span>
    </label>

    <div class="relative">
      <select
        :id="id"
        v-model="modelo"
        :required="requerido"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? idError : undefined"
        class="w-full appearance-none rounded-xl border bg-fondo-elevado px-3.5 py-2.5 text-sm text-texto transition-colors duration-150 focus-visible:border-acento"
        :class="error ? 'border-error' : 'border-borde-fuerte'"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="opcion in opciones" :key="opcion.valor" :value="opcion.valor">{{ opcion.texto }}</option>
      </select>
      <PhCaretDown class="pointer-events-none absolute top-1/2 right-3.5 size-[14px] -translate-y-1/2 text-texto-sutil" weight="bold" />
    </div>

    <p v-if="error" :id="idError" class="text-sm text-error">{{ error }}</p>
  </div>
</template>
