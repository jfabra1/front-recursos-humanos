<script setup>
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

const props = defineProps({
  retraso: { type: Number, default: 0 }, // ms, para escalonar varios elementos
});

const elemento = ref(null);
const visible = ref(false);

const { stop } = useIntersectionObserver(
  elemento,
  ([entrada]) => {
    if (entrada?.isIntersecting) {
      visible.value = true;
      stop();
    }
  },
  { threshold: 0.15 },
);
</script>

<template>
  <div
    ref="elemento"
    class="transition-all duration-700 ease-[var(--ease-salida)]"
    :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
    :style="{ transitionDelay: `${retraso}ms` }"
  >
    <slot />
  </div>
</template>
