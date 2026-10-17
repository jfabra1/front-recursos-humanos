<script setup>
// `paginacion` es el objeto que ya devuelve el backend tal cual (ver RespuestaApi.paginacion):
// { pagina, limite, total, totalPaginas, hayPaginaSiguiente, hayPaginaAnterior }.
const OPCIONES_LIMITE = [10, 20, 50, 100];

defineProps({
  paginacion: { type: Object, required: true },
  // El tamaño de página actual, controlado por el store (por defecto 10) — el usuario puede
  // cambiarlo aquí mismo, nunca se recorta en el frontend, siempre se vuelve a pedir al backend.
  limite: { type: Number, required: true },
});

defineEmits(["anterior", "siguiente", "cambiar-limite"]);
</script>

<template>
  <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3 text-xs text-texto-sutil">
      <span>Página {{ paginacion.pagina }} de {{ paginacion.totalPaginas }} · {{ paginacion.total }} en total</span>
      <label class="flex items-center gap-1.5">
        Por página
        <select
          :value="limite"
          class="rounded-lg border border-borde-fuerte bg-fondo-elevado px-2 py-1 text-xs text-texto focus-visible:border-acento"
          aria-label="Resultados por página"
          @change="$emit('cambiar-limite', Number($event.target.value))"
        >
          <option v-for="opcion in OPCIONES_LIMITE" :key="opcion" :value="opcion">{{ opcion }}</option>
        </select>
      </label>
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-lg border border-borde-fuerte px-3 py-1.5 text-sm font-medium text-texto transition-colors hover:bg-fondo-elevado disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!paginacion.hayPaginaAnterior"
        @click="$emit('anterior')"
      >
        Anterior
      </button>
      <button
        type="button"
        class="rounded-lg border border-borde-fuerte px-3 py-1.5 text-sm font-medium text-texto transition-colors hover:bg-fondo-elevado disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!paginacion.hayPaginaSiguiente"
        @click="$emit('siguiente')"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>
