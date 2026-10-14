<script setup>
import { RouterLink } from "vue-router";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";

const enlaces = [
  { href: "#modulos", texto: "Módulos" },
  { href: "#cumplimiento", texto: "Cumplimiento" },
  { href: "#planes", texto: "Planes" },
];
</script>

<template>
  <header class="sticky top-0 z-40 bg-fondo/70 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-12">
      <a href="#" class="flex items-center gap-2.5">
        <span class="flex size-8 items-center justify-center rounded-[9px] bg-acento text-base font-bold text-acento-texto" aria-hidden="true">S</span>
        <span class="text-lg font-semibold tracking-tight text-texto">SGTH</span>
      </a>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          v-for="enlace in enlaces"
          :key="enlace.href"
          :href="enlace.href"
          class="text-sm font-medium text-texto-sutil transition-colors hover:text-texto"
        >
          {{ enlace.texto }}
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <ConmutadorTema class="hidden sm:inline-flex" />
        <RouterLink
          :to="{ name: 'iniciar-sesion' }"
          class="inline-flex items-center justify-center rounded-xl bg-acento px-4 py-2 text-sm font-medium text-acento-texto transition-colors duration-150 hover:bg-acento-hover active:scale-[0.98]"
        >
          Iniciar sesión
        </RouterLink>
      </div>
    </div>
  </header>
</template>
