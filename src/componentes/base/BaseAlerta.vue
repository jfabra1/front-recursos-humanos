<script setup>
import { PhCheckCircle, PhInfo, PhWarningCircle } from "@phosphor-icons/vue";

defineProps({
  tipo: { type: String, default: "error" }, // error | exito | info
});

const clasesPorTipo = {
  error: "border-error-borde bg-error-fondo text-error",
  exito: "border-exito/30 bg-exito/10 text-exito",
  info: "border-borde-fuerte bg-fondo-elevado text-texto-sutil",
};

const iconoPorTipo = { error: PhWarningCircle, exito: PhCheckCircle, info: PhInfo };
</script>

<template>
  <div role="alert" class="flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm" :class="clasesPorTipo[tipo]">
    <component :is="iconoPorTipo[tipo]" class="mt-0.5 size-[18px] shrink-0" weight="fill" />
    <div class="leading-snug"><slot /></div>
  </div>
</template>
