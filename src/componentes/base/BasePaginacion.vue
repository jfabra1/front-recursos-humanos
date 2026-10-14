<script setup>
// `paginacion` es el objeto que ya devuelve el backend tal cual (ver RespuestaApi.paginacion):
// { pagina, limite, total, totalPaginas, hayPaginaSiguiente, hayPaginaAnterior }. No se oculta
// cuando solo hay una página — simplemente no tiene sentido mostrar botones deshabilitados todo
// el tiempo, así que el padre no debería montar este componente si `totalPaginas <= 1`.
defineProps({
  paginacion: { type: Object, required: true },
});

defineEmits(["anterior", "siguiente"]);
</script>

<template>
  <div class="mt-4 flex items-center justify-between gap-4">
    <p class="text-xs text-texto-sutil">Página {{ paginacion.pagina }} de {{ paginacion.totalPaginas }} · {{ paginacion.total }} en total</p>
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
