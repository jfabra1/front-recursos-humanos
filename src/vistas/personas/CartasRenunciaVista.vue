<script setup>
import { onMounted, ref } from "vue";
import { PhClockCounterClockwise, PhEye, PhFileX, PhProhibit } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import ModalEvidenciaFirma from "@/componentes/comunes/ModalEvidenciaFirma.vue";
import { useCartaRenunciaStore } from "@/stores/cartaRenuncia.store";
import solicitudFirmaServicio from "@/servicios/solicitudFirma.servicio";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { formatoFecha, formatoFechaHora } from "@/utils/formato.util";

const cartasStore = useCartaRenunciaStore();
const { puede } = usePermisos();

const ETIQUETAS_ESTADO = {
  borrador: "Borrador",
  pendiente_firma: "Pendiente de firma",
  firmada: "Firmada",
  anulada: "Anulada",
};

onMounted(() => {
  cartasStore.cargarCartas();
});

function manejarFiltrar() {
  cartasStore.cargarCartas();
}

const modalDetalleAbierto = ref(false);
const cartaDetalle = ref(null);
const solicitudFirmaDetalle = ref(null);
const modalEvidenciaAbierto = ref(false);

async function abrirDetalle(carta) {
  cartaDetalle.value = carta;
  modalDetalleAbierto.value = true;
  solicitudFirmaDetalle.value = null;

  const tieneSolicitud = carta.estado === "pendiente_firma" || carta.estado === "firmada";
  if (tieneSolicitud && puede(MODULOS.SOLICITUD_FIRMA, ACCIONES.LEER)) {
    const { data: respuesta } = await solicitudFirmaServicio.listar({ documentoId: carta._id });
    const solicitudes = respuesta.data.solicitudes;
    solicitudFirmaDetalle.value = solicitudes.find((solicitud) => solicitud.estado === "firmado") || solicitudes.find((solicitud) => solicitud.estado === "pendiente") || null;
  }
}

const confirmandoId = ref(null);

function manejarAnular(carta) {
  if (confirmandoId.value !== carta._id) {
    confirmandoId.value = carta._id;
    setTimeout(() => {
      if (confirmandoId.value === carta._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  cartasStore.anular(carta._id);
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Cartas de renuncia</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Cartas que los empleados redactaron y enviaron a firma desde su propio perfil.</p>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseSelect
        v-model="cartasStore.filtros.estado"
        label="Estado"
        placeholder="Todos"
        class="w-56"
        :opciones="[
          { valor: 'borrador', texto: 'Borrador' },
          { valor: 'pendiente_firma', texto: 'Pendiente de firma' },
          { valor: 'firmada', texto: 'Firmada' },
          { valor: 'anulada', texto: 'Anulada' },
        ]"
        @update:model-value="manejarFiltrar"
      />
    </div>

    <BaseAlerta v-if="cartasStore.error" tipo="error" class="mt-6">{{ cartasStore.error }}</BaseAlerta>
    <BaseAlerta v-if="cartasStore.errorAccion" tipo="error" class="mt-6">{{ cartasStore.errorAccion }}</BaseAlerta>

    <p v-if="cartasStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando…</p>

    <div
      v-else-if="cartasStore.cartas.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhFileX class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay cartas de renuncia con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="carta in cartasStore.cartas" :key="carta._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ carta.empleadoId?.personaId?.nombres }} {{ carta.empleadoId?.personaId?.apellidos }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_ESTADO[carta.estado] }}</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            {{ carta.empleadoId?.cargoId?.nombre || "—" }} · {{ carta.empleadoId?.sedeId?.nombre || "—" }} · Creada {{ formatoFechaHora(carta.createdAt) }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Ver detalles"
            title="Ver detalles"
            @click="abrirDetalle(carta)"
          >
            <PhEye class="size-4" />
          </button>
          <button
            v-if="carta.estado !== 'anulada' && puede(MODULOS.CARTA_RENUNCIA, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === carta._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(carta)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === carta._id ? "¿Confirmar?" : "Anular" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="cartasStore.paginacion"
      :paginacion="cartasStore.paginacion"
      :limite="cartasStore.limite"
      @anterior="cartasStore.irAPaginaAnterior"
      @siguiente="cartasStore.irAPaginaSiguiente"
      @cambiar-limite="cartasStore.cambiarLimite"
    />

    <BaseModal v-model="modalDetalleAbierto" titulo="Carta de renuncia">
      <template v-if="cartaDetalle">
        <div class="flex flex-col gap-4 text-sm">
          <div>
            <p class="text-xs text-texto-sutil">Empleado</p>
            <p class="mt-0.5 text-texto">
              {{ cartaDetalle.empleadoId?.personaId?.nombres }} {{ cartaDetalle.empleadoId?.personaId?.apellidos }}
              ({{ cartaDetalle.empleadoId?.personaId?.numeroDocumento }})
            </p>
          </div>
          <div v-if="cartaDetalle.motivo">
            <p class="text-xs text-texto-sutil">Motivo</p>
            <p class="mt-0.5 text-texto">{{ cartaDetalle.motivo }}</p>
          </div>
          <div v-if="cartaDetalle.fechaUltimoDiaLaborado">
            <p class="text-xs text-texto-sutil">Último día laborado</p>
            <p class="mt-0.5 text-texto">{{ formatoFecha(cartaDetalle.fechaUltimoDiaLaborado) }}</p>
          </div>
          <div>
            <p class="text-xs text-texto-sutil">Carta</p>
            <p class="mt-1 whitespace-pre-wrap rounded-xl border border-borde bg-fondo p-4 text-texto">{{ cartaDetalle.cuerpo }}</p>
          </div>
          <BaseBoton v-if="solicitudFirmaDetalle" ancho="auto" variante="secundario" @click="modalEvidenciaAbierto = true">
            <PhClockCounterClockwise class="size-4" />
            Ver evidencia de firma
          </BaseBoton>
        </div>
      </template>
    </BaseModal>

    <ModalEvidenciaFirma v-model="modalEvidenciaAbierto" :solicitud="solicitudFirmaDetalle" />
  </div>
</template>
