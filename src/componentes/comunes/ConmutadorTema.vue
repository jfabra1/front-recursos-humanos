<script setup>
import { PhMoon, PhSun } from "@phosphor-icons/vue";
import { usePreferenciasTema } from "@/composables/usePreferenciasTema";

const { esOscuro, alternarTema } = usePreferenciasTema();
</script>

<template>
  <button
    type="button"
    class="inline-flex size-10 items-center justify-center rounded-full border border-borde-fuerte bg-fondo-elevado text-texto-sutil transition-colors duration-150 hover:text-texto"
    :aria-label="esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    @click="alternarTema()"
  >
    <PhSun v-if="esOscuro" class="size-[18px]" />
    <PhMoon v-else class="size-[18px]" />
  </button>
</template>
