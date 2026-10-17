<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { PhCheckCircle, PhSignature } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";
import { useFirmaPublicaStore } from "@/stores/firmaPublica.store";

const route = useRoute();
const empresaSlug = route.params.empresaSlug;
const token = route.params.token;

const store = useFirmaPublicaStore();

const codigoOtp = ref("");
const consentimiento = ref(false);
const otpSolicitado = ref(false);

const MENSAJES_ESTADO = {
  firmado: "Este documento ya fue firmado. Si necesitas una copia, revisa el correo que te enviamos.",
  expirado: "Este enlace venció. Solicita uno nuevo a RR. HH.",
  anulado: "Este enlace ya no está disponible.",
};

onMounted(async () => {
  await store.cargarMeta(empresaSlug, token);
  if (store.meta?.estado === "pendiente" && store.meta.otpVerificado) {
    store.cargarDocumento(empresaSlug, token);
  }
});

async function manejarSolicitarOtp() {
  const exito = await store.solicitarOtp(empresaSlug, token);
  if (exito) otpSolicitado.value = true;
}

async function manejarVerificarOtp() {
  const exito = await store.verificarOtp(empresaSlug, token, codigoOtp.value);
  if (exito) await store.cargarDocumento(empresaSlug, token);
}

async function manejarFirmar() {
  await store.firmar(empresaSlug, token, consentimiento.value);
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-fondo px-4 py-10">
    <ConmutadorTema class="fixed top-4 right-4" />

    <div class="w-full max-w-md rounded-2xl border border-borde bg-fondo-elevado p-7 shadow-[var(--sombra-panel)]">
      <div class="flex items-center gap-2.5">
        <span class="flex size-8 items-center justify-center rounded-[9px] bg-acento text-base font-bold text-acento-texto" aria-hidden="true">S</span>
        <span class="text-lg font-semibold tracking-tight text-texto">SGTH</span>
      </div>

      <p v-if="store.cargando" class="mt-8 text-sm text-texto-sutil">Cargando…</p>
      <BaseAlerta v-else-if="store.error" tipo="error" class="mt-8">{{ store.error }}</BaseAlerta>

      <template v-else-if="store.meta">
        <!-- Estados terminales: no hay nada más que hacer en esta página -->
        <div v-if="store.meta.estado !== 'pendiente'" class="mt-8 flex flex-col items-center gap-3 py-6 text-center">
          <PhCheckCircle v-if="store.meta.estado === 'firmado'" class="size-8 text-exito" weight="fill" />
          <p class="text-sm text-texto-sutil">{{ MENSAJES_ESTADO[store.meta.estado] }}</p>
        </div>

        <!-- Firmado justo ahora en esta misma visita -->
        <div v-else-if="store.firmado" class="mt-8 flex flex-col items-center gap-3 py-6 text-center">
          <PhCheckCircle class="size-8 text-exito" weight="fill" />
          <h2 class="text-base font-semibold text-texto">¡Documento firmado!</h2>
          <p class="text-sm text-texto-sutil">Te enviamos una copia a tu correo registrado.</p>
        </div>

        <!-- Pendiente: primero verificar identidad por correo -->
        <div v-else-if="!store.meta.otpVerificado" class="mt-8">
          <h2 class="text-base font-semibold text-texto">Hola, {{ store.meta.nombreParcial }}</h2>
          <p class="mt-1.5 text-sm text-texto-sutil">Tienes un documento pendiente de firma. Primero confirma que eres tú.</p>

          <BaseAlerta v-if="store.errorOtp" tipo="error" class="mt-5">{{ store.errorOtp }}</BaseAlerta>

          <template v-if="!otpSolicitado">
            <p class="mt-5 text-sm text-texto-sutil">Te enviaremos un código a {{ store.meta.correoParcial }}.</p>
            <BaseBoton class="mt-4" :cargando="store.enviandoOtp" @click="manejarSolicitarOtp">Enviar código</BaseBoton>
          </template>
          <template v-else>
            <p class="mt-5 text-sm text-texto-sutil">
              Enviamos un código a {{ store.correoEnviadoA || store.meta.correoParcial }}. Vence en 10 minutos.
            </p>
            <form class="mt-4 flex flex-col gap-4" @submit.prevent="manejarVerificarOtp">
              <BaseInput v-model="codigoOtp" label="Código de verificación" placeholder="123456" requerido />
              <BaseBoton tipo="submit" :cargando="store.verificandoOtp">Verificar</BaseBoton>
            </form>
            <button type="button" class="mt-3 text-xs text-texto-sutil hover:text-texto hover:underline" @click="manejarSolicitarOtp">
              Reenviar código
            </button>
          </template>
        </div>

        <!-- Identidad verificada: ver y firmar el documento -->
        <div v-else class="mt-8">
          <h2 class="text-base font-semibold text-texto">Revisa y firma tu documento</h2>

          <p v-if="store.cargandoDocumento" class="mt-5 text-sm text-texto-sutil">Cargando documento…</p>
          <iframe v-else-if="store.documentoUrl" :src="store.documentoUrl" class="mt-5 h-96 w-full rounded-lg border border-borde" />

          <BaseAlerta v-if="store.errorFirmar" tipo="error" class="mt-4">{{ store.errorFirmar }}</BaseAlerta>

          <label class="mt-5 flex items-start gap-2.5 text-sm text-texto">
            <input v-model="consentimiento" type="checkbox" class="mt-0.5 size-4 shrink-0 rounded border-borde-fuerte text-acento focus:ring-acento" />
            Leí el documento completo y acepto firmarlo electrónicamente.
          </label>

          <BaseBoton class="mt-4" :deshabilitado="!consentimiento" :cargando="store.firmando" @click="manejarFirmar">
            <PhSignature class="size-4" weight="bold" />
            Firmar
          </BaseBoton>
        </div>
      </template>
    </div>
  </main>
</template>
