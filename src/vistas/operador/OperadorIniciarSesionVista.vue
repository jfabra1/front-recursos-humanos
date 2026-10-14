<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { PhShieldStar } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";
import { useOperadorStore } from "@/stores/operador.store";

const operador = useOperadorStore();
const router = useRouter();

const credenciales = reactive({ email: "", password: "" });

async function manejarEnvio() {
  const exito = await operador.iniciarSesion(credenciales);
  if (exito) router.push({ name: "operador-panel" });
}
</script>

<template>
  <main class="relative flex min-h-dvh items-center justify-center bg-fondo px-6 py-16">
    <ConmutadorTema class="fixed top-4 right-4 z-50 lg:top-6 lg:right-6" />

    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center text-center">
        <span class="flex size-11 items-center justify-center rounded-xl bg-texto text-fondo" aria-hidden="true">
          <PhShieldStar class="size-5" weight="fill" />
        </span>
        <h1 class="mt-4 text-xl font-semibold tracking-tight text-texto">Panel de operador</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Acceso restringido al equipo de SGTH SaaS</p>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-[var(--ease-salida)]"
        enter-from-class="-translate-y-1 opacity-0"
        leave-active-class="transition duration-150 ease-[var(--ease-salida)]"
        leave-to-class="opacity-0"
      >
        <BaseAlerta v-if="operador.error" tipo="error" class="mt-6">
          {{ operador.error }}
        </BaseAlerta>
      </Transition>

      <form class="mt-8 flex flex-col gap-5" novalidate @submit.prevent="manejarEnvio">
        <BaseInput
          v-model="credenciales.email"
          type="email"
          label="Correo electrónico"
          placeholder="operador@sgth.test"
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
        <BaseBoton tipo="submit" :cargando="operador.cargando" class="mt-1">Entrar al panel</BaseBoton>
      </form>

      <p class="mt-8 text-center text-sm text-texto-sutil">
        ¿Eres de una empresa cliente?
        <RouterLink :to="{ name: 'iniciar-sesion' }" class="font-medium text-acento hover:underline">Inicia sesión aquí</RouterLink>
      </p>
    </div>
  </main>
</template>
