<script setup>
import { onMounted, reactive, ref } from "vue";
import { PhPlus, PhScales } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseTextarea from "@/componentes/base/BaseTextarea.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useOperadorReglasLegalesStore } from "@/stores/operadorReglasLegales.store";
import { OPCIONES_ESTADO_VALIDACION, ETIQUETAS_ESTADO_VALIDACION, parsearValorReglaLegal, formatoValorReglaLegal } from "@/utils/reglaLegal.util";
import { formatoFecha } from "@/utils/formato.util";

const reglasStore = useOperadorReglasLegalesStore();

onMounted(() => {
  reglasStore.cargarReglas();
});

const modalAbierto = ref(false);
const errorValor = ref("");

const modalDetalleAbierto = ref(false);
const reglaDetalle = ref(null);

function verDetalle(regla) {
  reglaDetalle.value = regla;
  modalDetalleAbierto.value = true;
}

const formulario = reactive({
  codigo: "",
  pais: "CO",
  regimen: "CST_GENERAL",
  valorTexto: "",
  unidad: "",
  vigenteDesde: "",
  vigenteHasta: "",
  fundamentoTexto: "",
  supuestos: "",
  excepciones: "",
  precedencia: "",
  estadoValidacion: "BASE_NORMATIVA_IDENTIFICADA",
});

function abrirCrear() {
  Object.assign(formulario, {
    codigo: "",
    pais: "CO",
    regimen: "CST_GENERAL",
    valorTexto: "",
    unidad: "",
    vigenteDesde: "",
    vigenteHasta: "",
    fundamentoTexto: "",
    supuestos: "",
    excepciones: "",
    precedencia: "",
    estadoValidacion: "BASE_NORMATIVA_IDENTIFICADA",
  });
  errorValor.value = "";
  modalAbierto.value = true;
}

async function manejarCrear() {
  errorValor.value = "";
  const valor = parsearValorReglaLegal(formulario.valorTexto);
  if (valor === undefined) {
    errorValor.value = "El valor es obligatorio.";
    return;
  }

  const datos = {
    codigo: formulario.codigo,
    pais: formulario.pais,
    regimen: formulario.regimen,
    valor,
    unidad: formulario.unidad,
    vigenteDesde: formulario.vigenteDesde,
    ...(formulario.vigenteHasta ? { vigenteHasta: formulario.vigenteHasta } : {}),
    ...(formulario.fundamentoTexto.trim()
      ? { fundamento: formulario.fundamentoTexto.split(",").map((item) => item.trim()).filter(Boolean) }
      : {}),
    ...(formulario.supuestos.trim() ? { supuestos: formulario.supuestos.trim() } : {}),
    ...(formulario.excepciones.trim() ? { excepciones: formulario.excepciones.trim() } : {}),
    ...(formulario.precedencia ? { precedencia: Number(formulario.precedencia) } : {}),
    estadoValidacion: formulario.estadoValidacion,
  };

  if (await reglasStore.crearVersion(datos)) modalAbierto.value = false;
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
          Reglas legales
          <AyudaInfo
            texto="Parámetros normativos que usan los cálculos del sistema (jornada máxima, recargos, topes de horas extra, días de vacaciones, etc.), versionados por fecha de vigencia. Nunca se edita una fila existente: un cambio normativo se registra como una versión nueva, para poder recalcular el histórico correctamente."
          />
        </h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Catálogo versionado de reglas legales usadas por los cálculos del sistema.</p>
      </div>
      <BaseBoton ancho="auto" @click="abrirCrear">
        <PhPlus class="size-4" weight="bold" />
        Nueva versión
      </BaseBoton>
    </div>

    <div class="mt-6 flex flex-wrap items-end gap-3">
      <BaseInput
        v-model="reglasStore.filtros.codigo"
        label="Código"
        placeholder="COL_JORNADA_MAXIMA_SEMANAL"
        class="w-64"
        @keyup.enter="reglasStore.cargarReglas"
      />
      <BaseInput v-model="reglasStore.filtros.pais" label="País" placeholder="CO" class="w-32" @keyup.enter="reglasStore.cargarReglas" />
      <BaseSelect
        v-model="reglasStore.filtros.estadoValidacion"
        label="Estado de validación"
        placeholder="Todos"
        class="w-56"
        :opciones="OPCIONES_ESTADO_VALIDACION"
        @update:model-value="reglasStore.cargarReglas"
      />
      <BaseBoton ancho="auto" variante="secundario" @click="reglasStore.cargarReglas">Buscar</BaseBoton>
    </div>

    <BaseAlerta v-if="reglasStore.error" tipo="error" class="mt-6">{{ reglasStore.error }}</BaseAlerta>

    <p v-if="reglasStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando reglas…</p>

    <div
      v-else-if="reglasStore.reglas.length === 0"
      class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center"
    >
      <PhScales class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">No hay reglas con estos filtros.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="regla in reglasStore.reglas" :key="regla._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ regla.codigo }}</p>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ regla.pais }} · {{ regla.regimen }}</span>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">v{{ regla.version }}</span>
            <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_VALIDACION[regla.estadoValidacion] }}</span>
            <span v-if="!regla.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactiva</span>
          </div>
          <p class="mt-1 text-xs text-texto-sutil">
            Valor: <span class="font-medium text-texto">{{ formatoValorReglaLegal(regla.valor) }}</span> {{ regla.unidad }} · vigente desde
            {{ formatoFecha(regla.vigenteDesde) }}{{ regla.vigenteHasta ? ` hasta ${formatoFecha(regla.vigenteHasta)}` : " (sin fecha de fin)" }}
          </p>
          <p v-if="regla.supuestos" class="mt-1 truncate text-xs text-texto-sutil">{{ regla.supuestos }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-acento transition-colors hover:bg-acento/10"
          @click="verDetalle(regla)"
        >
          Ver más
        </button>
      </li>
    </ul>

    <BasePaginacion
      v-if="reglasStore.paginacion"
      :paginacion="reglasStore.paginacion"
      :limite="reglasStore.limite"
      @anterior="reglasStore.irAPaginaAnterior"
      @siguiente="reglasStore.irAPaginaSiguiente"
      @cambiar-limite="reglasStore.cambiarLimite"
    />

    <BaseModal v-model="modalAbierto" titulo="Nueva versión de regla legal">
      <BaseAlerta tipo="info" class="mb-5">
        Esto crea una fila nueva, nunca edita una existente. Si esta versión reemplaza a una vigente sin fecha de fin, recuerda que esa fila anterior no se cierra sola — es información para seguimiento manual por ahora.
      </BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarCrear">
        <BaseAlerta v-if="reglasStore.errorCreacion" tipo="error">{{ reglasStore.errorCreacion }}</BaseAlerta>
        <BaseInput v-model="formulario.codigo" label="Código" placeholder="COL_JORNADA_MAXIMA_SEMANAL" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.pais" label="País" placeholder="CO" requerido />
          <BaseInput v-model="formulario.regimen" label="Régimen" placeholder="CST_GENERAL" requerido />
        </div>
        <div>
          <BaseInput v-model="formulario.valorTexto" label="Valor" placeholder='48 ó {"inicio":"06:00","fin":"19:00"}' :error="errorValor" requerido />
          <p class="mt-1.5 flex items-start gap-1 text-xs text-texto-sutil">
            Puede ser un número, texto o un JSON (para franjas horarias, por ejemplo).
            <AyudaInfo texto="Un número o texto simple se guarda tal cual. Para una franja horaria, escribe un JSON como {&quot;inicio&quot;:&quot;06:00&quot;,&quot;fin&quot;:&quot;19:00&quot;}." />
          </p>
        </div>
        <BaseInput v-model="formulario.unidad" label="Unidad" placeholder="HORAS_SEMANA, PORCENTAJE, DIAS_HABILES…" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="formulario.vigenteDesde" type="date" label="Vigente desde" requerido />
          <BaseInput v-model="formulario.vigenteHasta" type="date" label="Vigente hasta (opcional)" />
        </div>
        <BaseSelect v-model="formulario.estadoValidacion" label="Estado de validación" :opciones="OPCIONES_ESTADO_VALIDACION" requerido />
        <BaseInput v-model="formulario.fundamentoTexto" label="Fundamento (opcional)" placeholder="CST art. 161, Ley 2466 de 2025" />
        <BaseTextarea v-model="formulario.supuestos" label="Supuestos (opcional)" :filas="2" />
        <BaseTextarea v-model="formulario.excepciones" label="Excepciones (opcional)" :filas="2" />
        <BaseInput v-model="formulario.precedencia" type="number" label="Precedencia (opcional)" placeholder="0" />
        <BaseBoton tipo="submit" :cargando="reglasStore.creando" class="mt-1">Crear versión</BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalDetalleAbierto" :titulo="reglaDetalle?.codigo || 'Detalle de la regla'">
      <template v-if="reglaDetalle">
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ reglaDetalle.pais }} · {{ reglaDetalle.regimen }}</span>
          <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">v{{ reglaDetalle.version }}</span>
          <span class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">{{ ETIQUETAS_ESTADO_VALIDACION[reglaDetalle.estadoValidacion] }}</span>
          <span v-if="!reglaDetalle.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactiva</span>
        </div>

        <dl class="mt-5 flex flex-col gap-4 text-sm">
          <div>
            <dt class="text-xs text-texto-sutil">Valor</dt>
            <dd class="mt-0.5 text-texto">{{ formatoValorReglaLegal(reglaDetalle.valor) }} {{ reglaDetalle.unidad }}</dd>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Vigente desde</dt>
              <dd class="mt-0.5 text-texto">{{ formatoFecha(reglaDetalle.vigenteDesde) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Vigente hasta</dt>
              <dd class="mt-0.5 text-texto">{{ reglaDetalle.vigenteHasta ? formatoFecha(reglaDetalle.vigenteHasta) : "Sin fecha de fin" }}</dd>
            </div>
          </div>
          <div v-if="reglaDetalle.precedencia">
            <dt class="text-xs text-texto-sutil">Precedencia</dt>
            <dd class="mt-0.5 text-texto">{{ reglaDetalle.precedencia }}</dd>
          </div>
          <div v-if="reglaDetalle.fundamento?.length">
            <dt class="text-xs text-texto-sutil">Fundamento</dt>
            <dd class="mt-0.5 flex flex-col gap-1 text-texto">
              <span v-for="(item, indice) in reglaDetalle.fundamento" :key="indice">· {{ item }}</span>
            </dd>
          </div>
          <div v-if="reglaDetalle.supuestos">
            <dt class="text-xs text-texto-sutil">Supuestos</dt>
            <dd class="mt-0.5 leading-relaxed text-texto">{{ reglaDetalle.supuestos }}</dd>
          </div>
          <div v-if="reglaDetalle.excepciones">
            <dt class="text-xs text-texto-sutil">Excepciones</dt>
            <dd class="mt-0.5 leading-relaxed text-texto">{{ reglaDetalle.excepciones }}</dd>
          </div>
          <div v-if="reglaDetalle.fechaConsulta">
            <dt class="text-xs text-texto-sutil">Fecha de consulta</dt>
            <dd class="mt-0.5 text-texto">{{ formatoFecha(reglaDetalle.fechaConsulta) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-texto-sutil">Registrada</dt>
            <dd class="mt-0.5 text-texto">{{ formatoFecha(reglaDetalle.createdAt) }}</dd>
          </div>
        </dl>
      </template>
    </BaseModal>
  </div>
</template>
