<script setup>
import { RouterLink } from "vue-router";
import { PhArrowRight, PhBuildings, PhPackage, PhScales } from "@phosphor-icons/vue";
import { useOperadorStore } from "@/stores/operador.store";

const operador = useOperadorStore();

const accesos = [
  { nombre: "operador-empresas", titulo: "Empresas", descripcion: "Dar de alta, suspender o reactivar empresas clientes.", icono: PhBuildings },
  { nombre: "operador-planes", titulo: "Planes", descripcion: "Planes de suscripción y sus límites.", icono: PhPackage },
  { nombre: "operador-reglas-legales", titulo: "Reglas legales", descripcion: "Parámetros normativos versionados (jornada, recargos, topes).", icono: PhScales },
];
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Hola, {{ operador.operador?.nombre }}</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Panel de operador de la plataforma SGTH SaaS.</p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="acceso in accesos"
        :key="acceso.nombre"
        :to="{ name: acceso.nombre }"
        class="group flex flex-col gap-3 rounded-2xl border border-borde bg-fondo-elevado p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sombra-panel)]"
      >
        <span class="flex size-10 items-center justify-center rounded-xl bg-acento/10 text-acento">
          <component :is="acceso.icono" class="size-5" weight="bold" />
        </span>
        <div>
          <h3 class="text-base font-semibold text-texto">{{ acceso.titulo }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-texto-sutil">{{ acceso.descripcion }}</p>
        </div>
        <span class="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-acento">
          Ir a {{ acceso.titulo.toLowerCase() }}
          <PhArrowRight class="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </RouterLink>
    </div>
  </div>
</template>
