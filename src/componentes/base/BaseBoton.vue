<script setup>
import { PhCircleNotch } from "@phosphor-icons/vue";

defineProps({
  variante: { type: String, default: "primario" }, // primario | secundario | peligro
  tipo: { type: String, default: "button" },
  cargando: { type: Boolean, default: false },
  deshabilitado: { type: Boolean, default: false },
  ancho: { type: String, default: "completo" }, // completo | auto
});

const emit = defineEmits(["click"]);

const clasesPorVariante = {
  primario: "bg-acento text-acento-texto hover:bg-acento-hover",
  secundario: "border border-borde-fuerte bg-transparent text-texto hover:bg-fondo-elevado",
  peligro: "border border-error-borde bg-transparent text-error hover:bg-error-fondo",
};
</script>

<template>
  <button
    :type="tipo"
    :disabled="deshabilitado || cargando"
    class="relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-[background-color,transform] duration-150 ease-[var(--ease-salida)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
    :class="[clasesPorVariante[variante], ancho === 'completo' ? 'w-full' : 'w-auto']"
    @click="emit('click', $event)"
  >
    <PhCircleNotch v-if="cargando" class="size-4 animate-spin" weight="bold" />
    <slot />
  </button>
</template>
