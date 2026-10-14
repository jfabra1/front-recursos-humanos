<script setup>
import { onMounted, reactive, ref } from "vue";
import { PhClockCountdown, PhPencilSimple, PhPlus, PhProhibit } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseTextarea from "@/componentes/base/BaseTextarea.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useHorariosStore } from "@/stores/horarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_HORARIO, ETIQUETAS_TIPO_HORARIO } from "@/utils/jornada.util";

const horariosStore = useHorariosStore();
const { puede } = usePermisos();

onMounted(() => {
  horariosStore.cargarPaginaHorarios();
});

const modalAbierto = ref(false);
const horarioEditando = ref(null);
const confirmandoId = ref(null);
const errorJson = ref("");

const formulario = reactive({ nombre: "", tipo: "fijo", reglasFranjaTexto: "" });

function abrirCrear() {
  horarioEditando.value = null;
  errorJson.value = "";
  Object.assign(formulario, { nombre: "", tipo: "fijo", reglasFranjaTexto: "" });
  modalAbierto.value = true;
}

function abrirEditar(horario) {
  horarioEditando.value = horario;
  errorJson.value = "";
  Object.assign(formulario, {
    nombre: horario.nombre,
    tipo: horario.tipo,
    reglasFranjaTexto: horario.reglasFranja ? JSON.stringify(horario.reglasFranja, null, 2) : "",
  });
  modalAbierto.value = true;
}

async function manejarEnvio() {
  errorJson.value = "";
  let reglasFranja;
  if (formulario.reglasFranjaTexto.trim()) {
    try {
      reglasFranja = JSON.parse(formulario.reglasFranjaTexto);
    } catch {
      errorJson.value = "El JSON de reglas de franja no es válido.";
      return;
    }
  }

  const datos = { nombre: formulario.nombre, tipo: formulario.tipo, ...(reglasFranja !== undefined ? { reglasFranja } : {}) };

  const exito = horarioEditando.value
    ? await horariosStore.actualizarHorario(horarioEditando.value._id, datos)
    : await horariosStore.crearHorario(datos);

  if (exito) modalAbierto.value = false;
}

function manejarAnular(horario) {
  if (confirmandoId.value !== horario._id) {
    confirmandoId.value = horario._id;
    setTimeout(() => {
      if (confirmandoId.value === horario._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  horariosStore.anularHorario(horario._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Horarios</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Plantillas de horario reutilizables entre sedes.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.HORARIO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nuevo horario
      </BaseBoton>
    </div>

    <BaseAlerta v-if="horariosStore.error" tipo="error" class="mt-6">{{ horariosStore.error }}</BaseAlerta>
    <BaseAlerta v-if="horariosStore.errorAccion" tipo="error" class="mt-6">{{ horariosStore.errorAccion }}</BaseAlerta>

    <p v-if="horariosStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando horarios…</p>

    <div
      v-else-if="horariosStore.horariosPagina.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhClockCountdown class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no has registrado ningún horario.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="horario in horariosStore.horariosPagina" :key="horario._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ horario.nombre }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_TIPO_HORARIO[horario.tipo] }}</span>
            <span v-if="!horario.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactivo</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="puede(MODULOS.HORARIO, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Editar"
            @click="abrirEditar(horario)"
          >
            <PhPencilSimple class="size-[18px]" />
          </button>
          <button
            v-if="horario.activo && puede(MODULOS.HORARIO, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === horario._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(horario)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === horario._id ? "¿Confirmar?" : "Desactivar" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="horariosStore.paginacionHorarios && horariosStore.paginacionHorarios.totalPaginas > 1"
      :paginacion="horariosStore.paginacionHorarios"
      @anterior="horariosStore.irAPaginaAnteriorHorarios"
      @siguiente="horariosStore.irAPaginaSiguienteHorarios"
    />

    <BaseModal v-model="modalAbierto" :titulo="horarioEditando ? 'Editar horario' : 'Nuevo horario'">
      <BaseAlerta v-if="horariosStore.errorGuardado" tipo="error" class="mb-5">{{ horariosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Turno diurno administrativo" requerido />
        <BaseSelect v-model="formulario.tipo" label="Tipo" :opciones="OPCIONES_TIPO_HORARIO" requerido />
        <div>
          <BaseTextarea
            v-model="formulario.reglasFranjaTexto"
            label="Reglas de franja (opcional)"
            placeholder='{"franjas": [{"inicio": "08:00", "fin": "17:00"}]}'
            :filas="4"
            :error="errorJson"
          />
          <p class="mt-1.5 flex items-start gap-1 text-xs text-texto-sutil">
            Formato libre en JSON, sin un esquema fijo del sistema.
            <AyudaInfo texto="Úsalo para anotar franjas horarias, descansos u otra configuración interna que tu equipo necesite consultar — el backend lo guarda tal cual, no lo valida ni lo procesa." />
          </p>
        </div>
        <BaseBoton tipo="submit" :cargando="horariosStore.guardando" class="mt-2">
          {{ horarioEditando ? "Guardar cambios" : "Crear horario" }}
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
