<script setup>
import { onMounted, reactive, ref } from "vue";
import { PhClockCountdown, PhPencilSimple, PhPlus, PhProhibit, PhTrash } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useHorariosStore } from "@/stores/horarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_TIPO_HORARIO, ETIQUETAS_TIPO_HORARIO, OPCIONES_DIA_SEMANA } from "@/utils/jornada.util";

const horariosStore = useHorariosStore();
const { puede } = usePermisos();

onMounted(() => {
  horariosStore.cargarPaginaHorarios();
});

const modalAbierto = ref(false);
const horarioEditando = ref(null);
const confirmandoId = ref(null);

function diaVacio() {
  return { trabaja: false, horaEntrada: "", horaSalida: "", descansos: [] };
}

function diasVacios() {
  return Object.fromEntries(OPCIONES_DIA_SEMANA.map((dia) => [dia.valor, diaVacio()]));
}

const formulario = reactive({
  nombre: "",
  tipo: "fijo",
  dias: diasVacios(),
  alternanciaActiva: false,
  alternanciaDiaSemana: "sabado",
  alternanciaFecha: "",
});

function abrirCrear() {
  horarioEditando.value = null;
  Object.assign(formulario, { nombre: "", tipo: "fijo", dias: diasVacios(), alternanciaActiva: false, alternanciaDiaSemana: "sabado", alternanciaFecha: "" });
  modalAbierto.value = true;
}

function abrirEditar(horario) {
  horarioEditando.value = horario;
  Object.assign(formulario, { nombre: horario.nombre, tipo: horario.tipo, dias: diasVacios(), alternanciaActiva: false, alternanciaDiaSemana: "sabado", alternanciaFecha: "" });

  const reglas = horario.reglasFranja;
  if (reglas?.dias) {
    for (const dia of OPCIONES_DIA_SEMANA) {
      const datosDia = reglas.dias[dia.valor];
      if (!datosDia) continue;
      formulario.dias[dia.valor] = {
        trabaja: Boolean(datosDia.trabaja),
        horaEntrada: datosDia.horaEntrada || "",
        horaSalida: datosDia.horaSalida || "",
        descansos: (datosDia.descansos || []).map((descanso) => ({ ...descanso })),
      };
    }
  }
  if (reglas?.alternancia) {
    formulario.alternanciaActiva = Boolean(reglas.alternancia.activa);
    formulario.alternanciaDiaSemana = reglas.alternancia.diaSemana || "sabado";
    formulario.alternanciaFecha = reglas.alternancia.fechaReferenciaTrabajada ? reglas.alternancia.fechaReferenciaTrabajada.slice(0, 10) : "";
  }

  modalAbierto.value = true;
}

function agregarDescanso(diaValor) {
  formulario.dias[diaValor].descansos.push({ horaInicio: "", duracionMinutos: 60 });
}

function quitarDescanso(diaValor, indice) {
  formulario.dias[diaValor].descansos.splice(indice, 1);
}

function construirReglasFranja() {
  const dias = {};
  for (const dia of OPCIONES_DIA_SEMANA) {
    const datosDia = formulario.dias[dia.valor];
    if (!datosDia.trabaja) continue; // día sin "trabaja:true" se asume libre — no hace falta mandarlo
    dias[dia.valor] = {
      trabaja: true,
      ...(datosDia.horaEntrada ? { horaEntrada: datosDia.horaEntrada } : {}),
      ...(datosDia.horaSalida ? { horaSalida: datosDia.horaSalida } : {}),
      descansos: datosDia.descansos
        .filter((descanso) => descanso.horaInicio && descanso.duracionMinutos)
        .map((descanso) => ({ horaInicio: descanso.horaInicio, duracionMinutos: Number(descanso.duracionMinutos) })),
    };
  }

  const reglasFranja = {};
  if (Object.keys(dias).length > 0) reglasFranja.dias = dias;
  if (formulario.alternanciaActiva && formulario.alternanciaFecha) {
    reglasFranja.alternancia = { activa: true, diaSemana: formulario.alternanciaDiaSemana, fechaReferenciaTrabajada: formulario.alternanciaFecha };
  }
  return reglasFranja;
}

async function manejarEnvio() {
  const datos = { nombre: formulario.nombre, tipo: formulario.tipo, reglasFranja: construirReglasFranja() };
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
            title="Editar"
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
      v-if="horariosStore.paginacionHorarios"
      :paginacion="horariosStore.paginacionHorarios"
      :limite="horariosStore.limite"
      @anterior="horariosStore.irAPaginaAnteriorHorarios"
      @siguiente="horariosStore.irAPaginaSiguienteHorarios"
      @cambiar-limite="horariosStore.cambiarLimiteHorarios"
    />

    <BaseModal v-model="modalAbierto" :titulo="horarioEditando ? 'Editar horario' : 'Nuevo horario'">
      <BaseAlerta v-if="horariosStore.errorGuardado" tipo="error" class="mb-5">{{ horariosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarEnvio">
        <BaseInput v-model="formulario.nombre" label="Nombre" placeholder="Turno diurno administrativo" requerido />
        <BaseSelect v-model="formulario.tipo" label="Tipo" :opciones="OPCIONES_TIPO_HORARIO" requerido />

        <div>
          <h3 class="text-sm font-medium text-texto">Días y horarios</h3>
          <p class="mt-1 text-xs text-texto-sutil">Un día sin marcar se asume libre.</p>

          <div class="mt-3 flex flex-col gap-3">
            <div v-for="dia in OPCIONES_DIA_SEMANA" :key="dia.valor" class="rounded-xl border border-borde p-3">
              <label class="flex items-center gap-2 text-sm font-medium text-texto">
                <input v-model="formulario.dias[dia.valor].trabaja" type="checkbox" class="size-4 rounded border-borde-fuerte text-acento focus:ring-acento" />
                {{ dia.texto }}
              </label>

              <div v-if="formulario.dias[dia.valor].trabaja" class="mt-3 flex flex-col gap-3 pl-6">
                <div class="grid grid-cols-2 gap-3">
                  <BaseInput v-model="formulario.dias[dia.valor].horaEntrada" type="time" label="Entrada" />
                  <BaseInput v-model="formulario.dias[dia.valor].horaSalida" type="time" label="Salida" />
                </div>

                <div v-if="formulario.dias[dia.valor].descansos.length > 0" class="flex flex-col gap-2">
                  <div v-for="(descanso, indice) in formulario.dias[dia.valor].descansos" :key="indice" class="flex items-end gap-2">
                    <BaseInput v-model="descanso.horaInicio" type="time" label="Inicio descanso" class="flex-1" />
                    <BaseInput v-model.number="descanso.duracionMinutos" type="number" label="Minutos" class="w-24" />
                    <button
                      type="button"
                      class="mb-0.5 rounded-lg p-2 text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error"
                      aria-label="Quitar descanso"
                      title="Quitar descanso"
                      @click="quitarDescanso(dia.valor, indice)"
                    >
                      <PhTrash class="size-4" />
                    </button>
                  </div>
                </div>
                <button type="button" class="self-start text-xs font-medium text-acento hover:underline" @click="agregarDescanso(dia.valor)">
                  + Agregar descanso
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-borde p-3">
          <label class="flex items-center gap-2 text-sm font-medium text-texto">
            <input v-model="formulario.alternanciaActiva" type="checkbox" class="size-4 rounded border-borde-fuerte text-acento focus:ring-acento" />
            Día alterno
            <AyudaInfo texto="Patrón 'un sábado sí, uno no' (u otro día). Indica una fecha conocida en la que SÍ se trabaja ese día — el sistema calcula el resto a partir de ahí." />
          </label>
          <div v-if="formulario.alternanciaActiva" class="mt-3 grid grid-cols-2 gap-3 pl-6">
            <BaseSelect v-model="formulario.alternanciaDiaSemana" label="Día de la semana" :opciones="OPCIONES_DIA_SEMANA" />
            <BaseInput v-model="formulario.alternanciaFecha" type="date" label="Una fecha que SÍ se trabaja" />
          </div>
        </div>

        <BaseBoton tipo="submit" :cargando="horariosStore.guardando" class="mt-2">
          {{ horarioEditando ? "Guardar cambios" : "Crear horario" }}
        </BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
