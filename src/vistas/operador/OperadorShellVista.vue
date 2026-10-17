<script setup>
import { ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { PhBuildings, PhHouse, PhList, PhPackage, PhScales, PhSignOut, PhX } from "@phosphor-icons/vue";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";
import { useOperadorStore } from "@/stores/operador.store";

const operador = useOperadorStore();
const router = useRouter();
const route = useRoute();

const menuMovilAbierto = ref(false);
const anioActual = new Date().getFullYear();

const enlaces = [
  { nombre: "operador-panel", texto: "Inicio", icono: PhHouse },
  { nombre: "operador-empresas", texto: "Empresas", icono: PhBuildings },
  { nombre: "operador-planes", texto: "Planes", icono: PhPackage },
  { nombre: "operador-reglas-legales", texto: "Reglas legales", icono: PhScales },
];

function cerrarSesion() {
  operador.cerrarSesion();
  router.push({ name: "operador-iniciar-sesion" });
}
</script>

<template>
  <div class="h-dvh overflow-hidden bg-fondo lg:grid lg:grid-cols-[260px_1fr]">
    <!-- Sidebar (desktop) / panel deslizable (mobile) — con scroll propio, independiente del contenido -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-borde bg-fondo-elevado transition-transform duration-200 ease-[var(--ease-salida)] lg:static lg:h-dvh lg:translate-x-0"
      :class="menuMovilAbierto && 'translate-x-0'"
    >
      <div class="flex shrink-0 items-center justify-between p-5 pb-0">
        <RouterLink :to="{ name: 'operador-panel' }" class="flex items-center gap-2.5">
          <span class="flex size-8 items-center justify-center rounded-[9px] bg-acento text-base font-bold text-acento-texto" aria-hidden="true">S</span>
          <div class="leading-none">
            <p class="text-lg font-semibold tracking-tight text-texto">SGTH</p>
            <p class="text-[10px] font-medium tracking-[0.08em] text-texto-sutil uppercase">Plataforma</p>
          </div>
        </RouterLink>
        <button type="button" class="text-texto-sutil lg:hidden" aria-label="Cerrar menú" title="Cerrar menú" @click="menuMovilAbierto = false">
          <PhX class="size-5" />
        </button>
      </div>

      <nav class="mt-6 flex-1 overflow-y-auto px-5 pb-5">
        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="enlace in enlaces"
            :key="enlace.nombre"
            :to="{ name: enlace.nombre }"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            :class="route.name === enlace.nombre ? 'bg-acento/10 text-acento' : 'text-texto-sutil hover:bg-fondo hover:text-texto'"
            @click="menuMovilAbierto = false"
          >
            <component :is="enlace.icono" class="size-[18px]" weight="bold" />
            {{ enlace.texto }}
          </RouterLink>
        </div>
      </nav>

      <div class="flex shrink-0 flex-col gap-3 border-t border-borde p-5">
        <div class="leading-tight">
          <p class="truncate text-sm font-medium text-texto">{{ operador.operador?.nombre }}</p>
          <p class="truncate text-xs text-texto-sutil">{{ operador.operador?.email }}</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
          @click="cerrarSesion"
        >
          <PhSignOut class="size-4" />
          Salir
        </button>
      </div>
    </aside>

    <div
      v-if="menuMovilAbierto"
      aria-hidden="true"
      class="fixed inset-0 z-30 bg-texto/20 backdrop-blur-sm lg:hidden"
      @click="menuMovilAbierto = false"
    />

    <!-- Columna derecha: header y footer fijos, solo el contenido del medio hace scroll -->
    <div class="flex h-dvh flex-col overflow-hidden">
      <header class="flex shrink-0 items-center justify-between gap-4 border-b border-borde px-6 py-4">
        <div class="flex items-center gap-4">
          <button type="button" class="text-texto-sutil lg:hidden" aria-label="Abrir menú" title="Abrir menú" @click="menuMovilAbierto = true">
            <PhList class="size-6" />
          </button>
          <span class="text-base font-semibold tracking-tight text-texto lg:hidden">SGTH</span>
        </div>

        <ConmutadorTema />
      </header>

      <main class="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">
        <RouterView />
      </main>

      <footer class="shrink-0 border-t border-borde px-6 py-3 text-center text-xs text-texto-sutil">
        SGTH SaaS © {{ anioActual }} — Panel de operador
      </footer>
    </div>
  </div>
</template>
