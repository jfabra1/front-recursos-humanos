<script setup>
import { computed, ref, useId } from "vue";
import { PhEye, PhEyeSlash } from "@phosphor-icons/vue";

const modelo = defineModel({ type: String, default: "" });

const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  error: { type: String, default: "" },
  requerido: { type: Boolean, default: false },
  deshabilitado: { type: Boolean, default: false },
  autocomplete: { type: String, default: "off" },
});

const id = useId();
const idError = `${id}-error`;
const mostrarPassword = ref(false);
const esPassword = computed(() => props.type === "password");
const tipoReal = computed(() => (esPassword.value && mostrarPassword.value ? "text" : props.type));
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-texto">
      {{ label }}<span v-if="requerido" class="text-error"> *</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        v-model="modelo"
        :type="tipoReal"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="requerido"
        :disabled="deshabilitado"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? idError : undefined"
        class="w-full rounded-xl border bg-fondo-elevado px-3.5 py-2.5 text-sm text-texto placeholder:text-texto-sutil transition-colors duration-150 focus-visible:border-acento disabled:cursor-not-allowed disabled:opacity-60"
        :class="error ? 'border-error' : 'border-borde-fuerte'"
      />
      <button
        v-if="esPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-texto-sutil transition-colors hover:text-texto"
        :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :title="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="mostrarPassword = !mostrarPassword"
      >
        <PhEyeSlash v-if="mostrarPassword" class="size-[18px]" />
        <PhEye v-else class="size-[18px]" />
      </button>
    </div>

    <p v-if="error" :id="idError" class="text-sm text-error">{{ error }}</p>
  </div>
</template>
