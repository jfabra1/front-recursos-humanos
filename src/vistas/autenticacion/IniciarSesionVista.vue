<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { PhBuildings, PhCalendarCheck, PhShieldCheck } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";
import RevelarAlEntrar from "@/componentes/comunes/RevelarAlEntrar.vue";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

const autenticacion = useAutenticacionStore();
const router = useRouter();

const credenciales = reactive({ email: "", password: "" });

const puntos = [
  { icono: PhCalendarCheck, texto: "Asistencia, turnos y vacaciones en un solo lugar" },
  { icono: PhBuildings, texto: "Pensado para empresas con varias sedes" },
  { icono: PhShieldCheck, texto: "Reglas laborales de Colombia, siempre vigentes" },
];

async function manejarEnvio() {
  const exito = await autenticacion.iniciarSesion(credenciales);
  if (exito) router.push({ name: "panel-inicio" });
}
</script>

<template>
  <main class="relative min-h-dvh overflow-hidden bg-fondo">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,var(--color-acento)_1px,transparent_0)] [background-size:28px_28px]"
    />
    <div aria-hidden="true" class="pointer-events-none absolute top-[-14rem] left-[-10rem] size-[520px] rounded-full bg-acento/20 blur-3xl" />
    <div aria-hidden="true" class="pointer-events-none absolute right-[-16rem] bottom-[-18rem] size-[560px] rounded-full bg-acento/10 blur-3xl" />

    <ConmutadorTema class="fixed top-4 right-4 z-50 lg:top-6 lg:right-6" />

    <div class="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8 lg:px-12 lg:py-10">
      <RevelarAlEntrar>
        <RouterLink :to="{ name: 'inicio' }" class="inline-flex items-center gap-2.5">
          <span class="flex size-8 items-center justify-center rounded-[9px] bg-acento text-base font-bold text-acento-texto" aria-hidden="true">S</span>
          <span class="text-lg font-semibold tracking-tight text-texto">SGTH</span>
        </RouterLink>
      </RevelarAlEntrar>

      <div class="grid flex-1 items-center gap-16 py-12 lg:grid-cols-[1.1fr_auto] lg:gap-24 lg:py-0">
        <RevelarAlEntrar :retraso="80" class="max-w-lg lg:pb-24">
          <h1 class="text-4xl leading-[1.08] font-semibold tracking-tight text-texto text-balance sm:text-5xl lg:text-[3.25rem]">
            Gestión de talento humano, <span class="text-acento">sin fricción</span>
          </h1>
          <ul class="mt-9 flex flex-col gap-4">
            <li v-for="punto in puntos" :key="punto.texto" class="flex items-start gap-3 text-[15px] leading-snug text-texto-sutil">
              <component :is="punto.icono" class="mt-0.5 size-5 shrink-0 text-acento" weight="bold" />
              {{ punto.texto }}
            </li>
          </ul>
        </RevelarAlEntrar>

        <RevelarAlEntrar :retraso="160" class="w-full max-w-sm justify-self-center lg:mt-20 lg:justify-self-end">
          <div class="rounded-2xl border border-borde bg-fondo-elevado p-8 shadow-[var(--sombra-panel)]">
            <h2 class="text-2xl font-semibold tracking-tight text-texto">Inicia sesión</h2>
            <p class="mt-1.5 text-sm text-texto-sutil">Ingresa tus credenciales para continuar</p>

            <Transition
              enter-active-class="transition duration-200 ease-[var(--ease-salida)]"
              enter-from-class="-translate-y-1 opacity-0"
              leave-active-class="transition duration-150 ease-[var(--ease-salida)]"
              leave-to-class="opacity-0"
            >
              <BaseAlerta v-if="autenticacion.error" tipo="error" class="mt-6">
                {{ autenticacion.error }}
              </BaseAlerta>
            </Transition>

            <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="manejarEnvio">
              <BaseInput
                v-model="credenciales.email"
                type="email"
                label="Correo electrónico"
                placeholder="nombre@empresa.com"
                autocomplete="username"
                requerido
              />
              <BaseInput
                v-model="credenciales.password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                autocomplete="current-password"
                requerido
              />
              <BaseBoton tipo="submit" :cargando="autenticacion.cargando" class="mt-1">Iniciar sesión</BaseBoton>
            </form>
          </div>

          <p class="mt-6 text-center text-sm text-texto-sutil">
            ¿Problemas para ingresar? Contacta al administrador de tu empresa.
          </p>
        </RevelarAlEntrar>
      </div>

      <RevelarAlEntrar :retraso="220">
        <p class="text-sm text-texto-sutil">© {{ new Date().getFullYear() }} SGTH SaaS</p>
      </RevelarAlEntrar>
    </div>
  </main>
</template>
