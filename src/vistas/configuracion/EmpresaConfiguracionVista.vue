<script setup>
import { computed, onMounted, reactive, watch } from "vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseInterruptor from "@/componentes/base/BaseInterruptor.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useEmpresaStore } from "@/stores/empresa.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const empresaStore = useEmpresaStore();
const { puede } = usePermisos();

onMounted(() => {
  empresaStore.cargarEmpresa();
});

const formulario = reactive({
  nombre: "",
  geocercaRadioMetrosDefault: "",
  recordatorioJornadaMinutos: "",
  requiereSegundaAprobacion: false,
});

// Cuando llegan los datos reales de la empresa, se precargan en el formulario.
watch(
  () => empresaStore.empresa,
  (empresa) => {
    if (!empresa) return;
    Object.assign(formulario, {
      nombre: empresa.nombre,
      geocercaRadioMetrosDefault: String(empresa.configuracion.geocercaRadioMetrosDefault),
      recordatorioJornadaMinutos: empresa.configuracion.recordatorioJornadaMinutos.join(", "),
      requiereSegundaAprobacion: Boolean(empresa.configuracion.requiereSegundaAprobacion),
    });
  },
  { immediate: true },
);

const soloLectura = computed(() => !puede(MODULOS.EMPRESA, ACCIONES.EDITAR));

async function manejarEnvio() {
  const minutos = formulario.recordatorioJornadaMinutos
    .split(",")
    .map((valor) => Number(valor.trim()))
    .filter((valor) => Number.isFinite(valor) && valor > 0);

  await empresaStore.actualizarEmpresa({
    nombre: formulario.nombre,
    configuracion: {
      geocercaRadioMetrosDefault: Number(formulario.geocercaRadioMetrosDefault),
      recordatorioJornadaMinutos: minutos,
      requiereSegundaAprobacion: formulario.requiereSegundaAprobacion,
    },
  });
}
</script>

<template>
  <div class="max-w-xl">
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Configuración de la empresa</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Datos generales y parámetros por defecto de tu empresa.</p>

    <BaseAlerta v-if="empresaStore.error" tipo="error" class="mt-6">{{ empresaStore.error }}</BaseAlerta>

    <p v-if="empresaStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando…</p>

    <template v-else-if="empresaStore.empresa">
      <dl class="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-borde bg-fondo-elevado p-5 sm:grid-cols-4">
        <div>
          <dt class="text-xs text-texto-sutil">Plan</dt>
          <dd class="mt-0.5 text-sm font-medium text-texto">{{ empresaStore.empresa.limites.maxEmpleados }} empleados</dd>
        </div>
        <div>
          <dt class="text-xs text-texto-sutil">Sedes</dt>
          <dd class="mt-0.5 text-sm font-medium text-texto">hasta {{ empresaStore.empresa.limites.maxSedes }}</dd>
        </div>
        <div>
          <dt class="text-xs text-texto-sutil">Dispositivos</dt>
          <dd class="mt-0.5 text-sm font-medium text-texto">hasta {{ empresaStore.empresa.limites.maxDispositivos }}</dd>
        </div>
        <div>
          <dt class="text-xs text-texto-sutil">Estado</dt>
          <dd class="mt-0.5 text-sm font-medium text-texto capitalize">{{ empresaStore.empresa.estado }}</dd>
        </div>
      </dl>
      <p class="mt-2 text-xs text-texto-sutil">
        El plan, los límites y el slug (<code class="text-texto">{{ empresaStore.empresa.slug }}</code
        >) los administra el operador de la plataforma, no se editan aquí.
      </p>

      <BaseAlerta v-if="soloLectura" tipo="info" class="mt-6">
        Solo el administrador de la empresa puede editar esta configuración. Puedes verla, pero no guardar cambios.
      </BaseAlerta>
      <BaseAlerta v-if="empresaStore.errorGuardado" tipo="error" class="mt-6">{{ empresaStore.errorGuardado }}</BaseAlerta>

      <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre de la empresa" requerido :deshabilitado="soloLectura" />

        <div>
          <BaseInput
            v-model="formulario.geocercaRadioMetrosDefault"
            type="number"
            label="Radio de geocerca por defecto (metros)"
            requerido
            :deshabilitado="soloLectura"
          />
          <p class="mt-1.5 flex items-start gap-1 text-xs text-texto-sutil">
            Distancia máxima entre el empleado y la sede para validar una marcación. Cada sede puede tener su propio radio.
            <AyudaInfo texto="Cuando una sede no tiene un radio propio configurado, se usa este valor por defecto al crearla." />
          </p>
        </div>

        <div>
          <BaseInput
            v-model="formulario.recordatorioJornadaMinutos"
            label="Minutos de recordatorio de jornada abierta"
            placeholder="5, 15, 30"
            :deshabilitado="soloLectura"
          />
          <p class="mt-1.5 flex items-start gap-1 text-xs text-texto-sutil">
            Minutos tras una entrada sin cierre en los que se avisa al empleado (y luego a su jefe) para evitar jornadas abiertas por error.
            <AyudaInfo texto="Escribe varios valores separados por coma, por ejemplo: 5, 15, 30. El sistema escala el aviso en ese orden." />
          </p>
        </div>

        <div class="rounded-xl border border-borde bg-fondo p-4">
          <BaseInterruptor
            v-model="formulario.requiereSegundaAprobacion"
            label="Exigir doble aprobación"
            descripcion="Vacaciones, permisos y horas extra necesitarán la aprobación de dos personas distintas con permiso de aprobar antes de quedar en firme."
            :deshabilitado="soloLectura"
          />
        </div>

        <BaseBoton v-if="!soloLectura" tipo="submit" :cargando="empresaStore.guardando" class="mt-1">Guardar cambios</BaseBoton>
      </form>
    </template>
  </div>
</template>
