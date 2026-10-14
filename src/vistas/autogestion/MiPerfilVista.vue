<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhCalendarCheck, PhClipboardText, PhLink, PhShieldCheck, PhUserCircle } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import { useAutogestionStore } from "@/stores/autogestion.store";
import { useHorariosStore } from "@/stores/horarios.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { ETIQUETAS_TIPO_VINCULO } from "@/utils/contrato.util";
import { formatoFecha, formatoFechaHora, formatoMoneda } from "@/utils/formato.util";

const autogestionStore = useAutogestionStore();
const horariosStore = useHorariosStore();
const { puede } = usePermisos();

const TODAS_LAS_PESTANAS = [
  { valor: "perfil", texto: "Mi perfil", icono: PhUserCircle, modulo: MODULOS.EMPLEADO },
  { valor: "documentos", texto: "Mis documentos", icono: PhClipboardText, modulo: MODULOS.DOCUMENTO },
  { valor: "turnos", texto: "Mis turnos", icono: PhCalendarCheck, modulo: MODULOS.TURNO },
  { valor: "privacidad", texto: "Privacidad", icono: PhShieldCheck, modulo: null },
];

const pestanasDisponibles = computed(() => TODAS_LAS_PESTANAS.filter((pestana) => !pestana.modulo || puede(pestana.modulo, ACCIONES.LEER)));
const pestanaActiva = ref(pestanasDisponibles.value[0]?.valor ?? "privacidad");

function nombreHorario(horarioId) {
  return horariosStore.horarios.find((horario) => horario._id === horarioId)?.nombre || "—";
}

const filtrosTurnos = reactive({ desde: "", hasta: "" });

function cargarPestana(valor) {
  pestanaActiva.value = valor;
  if (valor === "perfil" && !autogestionStore.empleado) autogestionStore.cargarPerfil();
  if (valor === "documentos" && autogestionStore.documentos.length === 0) autogestionStore.cargarDocumentos();
  if (valor === "turnos" && autogestionStore.turnos.length === 0) autogestionStore.cargarTurnos();
  if (valor === "privacidad" && !autogestionStore.politica) autogestionStore.cargarPolitica();
}

function manejarFiltrarTurnos() {
  const filtros = {};
  if (filtrosTurnos.desde) filtros.desde = filtrosTurnos.desde;
  if (filtrosTurnos.hasta) filtros.hasta = filtrosTurnos.hasta;
  autogestionStore.cargarTurnos(filtros);
}

onMounted(() => {
  if (horariosStore.horarios.length === 0) horariosStore.cargarHorarios();
  cargarPestana(pestanaActiva.value);
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-texto">Mi perfil</h1>
    <p class="mt-1.5 text-sm text-texto-sutil">Tu propia información, documentos y turnos — y qué datos capturamos de ti y por qué.</p>

    <div class="mt-6 flex gap-1 border-b border-borde">
      <button
        v-for="pestana in pestanasDisponibles"
        :key="pestana.valor"
        type="button"
        class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
        :class="pestanaActiva === pestana.valor ? 'border-acento text-acento' : 'border-transparent text-texto-sutil hover:text-texto'"
        @click="cargarPestana(pestana.valor)"
      >
        <component :is="pestana.icono" class="size-4" weight="bold" />
        {{ pestana.texto }}
      </button>
    </div>

    <!-- Perfil -->
    <section v-if="pestanaActiva === 'perfil'" class="mt-6">
      <BaseAlerta v-if="autogestionStore.errorPerfil" tipo="error">{{ autogestionStore.errorPerfil }}</BaseAlerta>
      <p v-else-if="autogestionStore.cargandoPerfil" class="text-sm text-texto-sutil">Cargando perfil…</p>
      <template v-else-if="autogestionStore.empleado">
        <div class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <h2 class="text-base font-semibold text-texto">
            {{ autogestionStore.empleado.personaId.nombres }} {{ autogestionStore.empleado.personaId.apellidos }}
          </h2>
          <div class="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p class="text-xs text-texto-sutil">Documento</p>
              <p class="mt-0.5 text-texto">{{ autogestionStore.empleado.personaId.numeroDocumento }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Correo</p>
              <p class="mt-0.5 text-texto">{{ autogestionStore.empleado.personaId.email || "—" }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Teléfono</p>
              <p class="mt-0.5 text-texto">{{ autogestionStore.empleado.personaId.telefono || "—" }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Sede</p>
              <p class="mt-0.5 text-texto">{{ autogestionStore.empleado.sedeId?.nombre || "—" }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Cargo</p>
              <p class="mt-0.5 text-texto">{{ autogestionStore.empleado.cargoId?.nombre || "—" }}</p>
            </div>
            <div>
              <p class="text-xs text-texto-sutil">Ingreso</p>
              <p class="mt-0.5 text-texto">{{ formatoFecha(autogestionStore.empleado.fechaIngreso) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-borde bg-fondo-elevado p-6">
          <h3 class="text-sm font-semibold text-texto">Contrato vigente</h3>
          <template v-if="autogestionStore.contratoVigente">
            <div class="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p class="text-xs text-texto-sutil">Tipo</p>
                <p class="mt-0.5 text-texto">{{ ETIQUETAS_TIPO_VINCULO[autogestionStore.contratoVigente.tipoVinculo] }}</p>
              </div>
              <div>
                <p class="text-xs text-texto-sutil">Inicio</p>
                <p class="mt-0.5 text-texto">{{ formatoFecha(autogestionStore.contratoVigente.fechaInicio) }}</p>
              </div>
              <div>
                <p class="text-xs text-texto-sutil">Fin</p>
                <p class="mt-0.5 text-texto">{{ formatoFecha(autogestionStore.contratoVigente.fechaFin) || "Indefinido" }}</p>
              </div>
              <div>
                <p class="text-xs text-texto-sutil">Salario</p>
                <p class="mt-0.5 text-texto">{{ formatoMoneda(autogestionStore.contratoVigente.salario) }}</p>
              </div>
            </div>
          </template>
          <p v-else class="mt-2 text-sm text-texto-sutil">No tienes un contrato vigente registrado.</p>
        </div>
      </template>
    </section>

    <!-- Documentos -->
    <section v-else-if="pestanaActiva === 'documentos'" class="mt-6">
      <BaseAlerta v-if="autogestionStore.errorDocumentos" tipo="error">{{ autogestionStore.errorDocumentos }}</BaseAlerta>
      <p v-else-if="autogestionStore.cargandoDocumentos" class="text-sm text-texto-sutil">Cargando documentos…</p>
      <div
        v-else-if="autogestionStore.documentos.length === 0"
        class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhClipboardText class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">No tienes documentos cargados todavía.</p>
      </div>
      <ul v-else class="flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="documento in autogestionStore.documentos" :key="documento._id" class="flex items-center justify-between gap-3 px-5 py-4">
          <div class="min-w-0">
            <p class="text-sm font-medium text-texto">{{ documento.tipo }}</p>
            <a
              :href="documento.archivoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 truncate text-xs text-acento hover:underline"
            >
              <PhLink class="size-3 shrink-0" />
              {{ documento.archivoUrl }}
            </a>
            <p v-if="documento.vigenciaHasta" class="mt-0.5 text-xs text-texto-sutil">Vigente hasta {{ formatoFecha(documento.vigenciaHasta) }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Turnos -->
    <section v-else-if="pestanaActiva === 'turnos'" class="mt-6">
      <div class="flex flex-wrap items-end gap-3">
        <BaseInput v-model="filtrosTurnos.desde" type="date" label="Desde" />
        <BaseInput v-model="filtrosTurnos.hasta" type="date" label="Hasta" />
        <BaseBoton ancho="auto" variante="secundario" @click="manejarFiltrarTurnos">Filtrar</BaseBoton>
      </div>

      <BaseAlerta v-if="autogestionStore.errorTurnos" tipo="error" class="mt-5">{{ autogestionStore.errorTurnos }}</BaseAlerta>
      <p v-else-if="autogestionStore.cargandoTurnos" class="mt-5 text-sm text-texto-sutil">Cargando turnos…</p>
      <div
        v-else-if="autogestionStore.turnos.length === 0"
        class="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
      >
        <PhCalendarCheck class="size-6 text-texto-sutil" />
        <p class="text-sm text-texto-sutil">No tienes turnos con estos filtros.</p>
      </div>
      <ul v-else class="mt-5 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
        <li v-for="turno in autogestionStore.turnos" :key="turno._id" class="px-5 py-4 text-sm">
          <p class="font-medium text-texto">{{ nombreHorario(turno.horarioId) }}</p>
          <p class="mt-0.5 text-xs text-texto-sutil">
            {{ formatoFecha(turno.fecha) }} · {{ formatoFechaHora(turno.horaInicioEsperada) }} – {{ formatoFechaHora(turno.horaFinEsperada) }}
          </p>
        </li>
      </ul>
    </section>

    <!-- Privacidad -->
    <section v-else-if="pestanaActiva === 'privacidad'" class="mt-6">
      <BaseAlerta v-if="autogestionStore.errorPolitica" tipo="error">{{ autogestionStore.errorPolitica }}</BaseAlerta>
      <p v-else-if="autogestionStore.cargandoPolitica" class="text-sm text-texto-sutil">Cargando…</p>
      <div v-else-if="autogestionStore.politica" class="flex flex-col gap-4">
        <div class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <h3 class="text-sm font-semibold text-texto">Geolocalización</h3>
          <dl class="mt-3 flex flex-col gap-2.5 text-sm text-texto-sutil">
            <div><dt class="font-medium text-texto">¿Cuándo se captura?</dt><dd>{{ autogestionStore.politica.geolocalizacion.cuandoSeCaptura }}</dd></div>
            <div><dt class="font-medium text-texto">¿Qué se guarda?</dt><dd>{{ autogestionStore.politica.geolocalizacion.queSeGuarda }}</dd></div>
            <div><dt class="font-medium text-texto">Finalidad</dt><dd>{{ autogestionStore.politica.geolocalizacion.finalidad }}</dd></div>
          </dl>
        </div>
        <div class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <h3 class="text-sm font-semibold text-texto">Biometría</h3>
          <dl class="mt-3 flex flex-col gap-2.5 text-sm text-texto-sutil">
            <div><dt class="font-medium text-texto">Tipo</dt><dd>{{ autogestionStore.politica.biometria.tipo }}</dd></div>
            <div><dt class="font-medium text-texto">¿Dónde vive?</dt><dd>{{ autogestionStore.politica.biometria.dondeVive }}</dd></div>
            <div><dt class="font-medium text-texto">Alternativa</dt><dd>{{ autogestionStore.politica.biometria.alternativa }}</dd></div>
          </dl>
        </div>
        <div class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <h3 class="text-sm font-semibold text-texto">Dispositivo registrado</h3>
          <dl class="mt-3 flex flex-col gap-2.5 text-sm text-texto-sutil">
            <div><dt class="font-medium text-texto">¿Por qué se registra?</dt><dd>{{ autogestionStore.politica.dispositivo.porQueSeRegistra }}</dd></div>
            <div><dt class="font-medium text-texto">Cambio de dispositivo</dt><dd>{{ autogestionStore.politica.dispositivo.cambioDeDispositivo }}</dd></div>
          </dl>
        </div>
        <div class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <h3 class="text-sm font-semibold text-texto">Bloqueos</h3>
          <dl class="mt-3 flex flex-col gap-2.5 text-sm text-texto-sutil">
            <div><dt class="font-medium text-texto">¿Qué pasa si me bloquean?</dt><dd>{{ autogestionStore.politica.bloqueos.quePasaSiMeBloquean }}</dd></div>
            <div><dt class="font-medium text-texto">¿Cómo reclamar?</dt><dd>{{ autogestionStore.politica.bloqueos.comoReclamar }}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  </div>
</template>
