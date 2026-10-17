<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhPlus, PhProhibit, PhShieldCheck, PhTrash, PhUserGear } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import AyudaInfo from "@/componentes/comunes/AyudaInfo.vue";
import { useRolesStore } from "@/stores/roles.store";
import { usePermisosPersonalizadosStore } from "@/stores/permisosPersonalizados.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { OPCIONES_ROL_BASE, ETIQUETAS_ROL_BASE, OPCIONES_ACCION, ETIQUETAS_ACCION, OPCIONES_ALCANCE, ETIQUETAS_ALCANCE, OPCIONES_MODULO, ETIQUETAS_MODULO } from "@/utils/rol.util";

const rolesStore = useRolesStore();
const permisosStore = usePermisosPersonalizadosStore();
const { puede } = usePermisos();

onMounted(() => {
  rolesStore.cargarRoles();
});

const confirmandoId = ref(null);

function manejarAnular(rol) {
  if (confirmandoId.value !== rol._id) {
    confirmandoId.value = rol._id;
    setTimeout(() => {
      if (confirmandoId.value === rol._id) confirmandoId.value = null;
    }, 4000);
    return;
  }
  confirmandoId.value = null;
  rolesStore.anularRol(rol._id);
}

// Modal crear/editar rol
const modalRolAbierto = ref(false);
const rolEditando = ref(null);
const formularioRol = reactive({ nombre: "", rolBase: "rrhh" });

function abrirCrearRol() {
  rolEditando.value = null;
  Object.assign(formularioRol, { nombre: "", rolBase: "rrhh" });
  modalRolAbierto.value = true;
}

function abrirEditarRol(rol) {
  rolEditando.value = rol;
  Object.assign(formularioRol, { nombre: rol.nombre, rolBase: rol.rolBase });
  modalRolAbierto.value = true;
}

async function manejarGuardarRol() {
  const exito = rolEditando.value
    ? await rolesStore.actualizarRol(rolEditando.value._id, { nombre: formularioRol.nombre })
    : await rolesStore.crearRol({ nombre: formularioRol.nombre, rolBase: formularioRol.rolBase });
  if (exito) modalRolAbierto.value = false;
}

// Modal de excepciones de permisos
const modalPermisosAbierto = ref(false);
const rolPermisos = ref(null);
const confirmandoExcepcionId = ref(null);
const formularioExcepcion = reactive({ modulo: "empleado", accion: "leer", alcance: "empresa", otorgado: "true" });

function abrirPermisos(rol) {
  rolPermisos.value = rol;
  permisosStore.cargarExcepciones(rol._id);
  rolesStore.cargarPermisosEfectivos(rol._id);
  modalPermisosAbierto.value = true;
}

// Resumen "lo que este rol puede hacer hoy" — módulo por módulo, en el mismo orden que
// OPCIONES_MODULO, mostrando solo los que tienen al menos una acción (evita listar 26 módulos
// en su mayoría vacíos). Es lo que faltaba para que "sin excepciones" no se leyera como "sin
// permisos": antes de esto, un rol como Empleado (que sí puede crear asistencia/vacaciones/etc.
// por la plantilla base) no mostraba nada de eso aquí, solo la lista de excepciones vacía.
const ORDEN_ACCIONES = OPCIONES_ACCION.map((opcion) => opcion.valor);

const modulosConAcceso = computed(() => {
  if (!rolesStore.permisosEfectivos) return [];
  return OPCIONES_MODULO.map((opcion) => ({
    modulo: opcion.valor,
    texto: opcion.texto,
    acciones: [...(rolesStore.permisosEfectivos[opcion.valor] || [])].sort((a, b) => ORDEN_ACCIONES.indexOf(a) - ORDEN_ACCIONES.indexOf(b)),
  })).filter((item) => item.acciones.length > 0);
});

async function manejarOtorgarExcepcion() {
  const datos = {
    rolId: rolPermisos.value._id,
    modulo: formularioExcepcion.modulo,
    accion: formularioExcepcion.accion,
    alcance: formularioExcepcion.alcance,
    otorgado: formularioExcepcion.otorgado === "true",
  };
  // El resumen "Lo que este rol puede hacer hoy" se calculó una vez al abrir el modal — sin
  // esto, quedaba desactualizado después de guardar una excepción hasta cerrar y reabrir.
  if (await permisosStore.otorgarExcepcion(datos)) rolesStore.cargarPermisosEfectivos(rolPermisos.value._id);
}

async function manejarEliminarExcepcion(excepcion) {
  if (confirmandoExcepcionId.value !== excepcion._id) {
    confirmandoExcepcionId.value = excepcion._id;
    setTimeout(() => {
      if (confirmandoExcepcionId.value === excepcion._id) confirmandoExcepcionId.value = null;
    }, 4000);
    return;
  }
  confirmandoExcepcionId.value = null;
  if (await permisosStore.eliminarExcepcion(excepcion._id)) rolesStore.cargarPermisosEfectivos(rolPermisos.value._id);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-texto">
          Roles y permisos
          <AyudaInfo
            texto="Cada rol parte de una de las 6 plantillas base del sistema (Administrador, RRHH, Jefe autorizado, etc.). Las excepciones de permisos te permiten conceder o quitar una acción puntual sin cambiar la plantilla base."
          />
        </h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Roles de la empresa y sus excepciones a la matriz de permisos por defecto.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.ROL, ACCIONES.CREAR)" ancho="auto" @click="abrirCrearRol">
        <PhPlus class="size-4" weight="bold" />
        Nuevo rol
      </BaseBoton>
    </div>

    <BaseAlerta v-if="rolesStore.error" tipo="error" class="mt-6">{{ rolesStore.error }}</BaseAlerta>
    <BaseAlerta v-if="rolesStore.errorAccion" tipo="error" class="mt-6">{{ rolesStore.errorAccion }}</BaseAlerta>

    <p v-if="rolesStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando roles…</p>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="rol in rolesStore.roles" :key="rol._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ rol.nombre }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ ETIQUETAS_ROL_BASE[rol.rolBase] }}</span>
            <span v-if="rol.esPersonalizado" class="rounded-full bg-fondo px-2 py-0.5 text-xs font-medium text-texto-sutil">Personalizado</span>
            <span v-if="!rol.activo" class="rounded-full bg-error-fondo px-2 py-0.5 text-xs font-medium text-error">Inactivo</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="puede(MODULOS.ROL, ACCIONES.LEER)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Permisos"
            title="Permisos"
            @click="abrirPermisos(rol)"
          >
            <PhShieldCheck class="size-[18px]" />
          </button>
          <button
            v-if="puede(MODULOS.ROL, ACCIONES.EDITAR)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Renombrar"
            title="Renombrar"
            @click="abrirEditarRol(rol)"
          >
            <PhUserGear class="size-[18px]" />
          </button>
          <button
            v-if="rol.activo && puede(MODULOS.ROL, ACCIONES.ELIMINAR)"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            :class="confirmandoId === rol._id ? 'bg-error text-acento-texto' : 'text-texto-sutil hover:bg-error-fondo hover:text-error'"
            @click="manejarAnular(rol)"
          >
            <span class="inline-flex items-center gap-1.5">
              <PhProhibit class="size-[14px]" />
              {{ confirmandoId === rol._id ? "¿Confirmar?" : "Desactivar" }}
            </span>
          </button>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="rolesStore.paginacion"
      :paginacion="rolesStore.paginacion"
      :limite="rolesStore.limite"
      @anterior="rolesStore.irAPaginaAnterior"
      @siguiente="rolesStore.irAPaginaSiguiente"
      @cambiar-limite="rolesStore.cambiarLimite"
    />

    <BaseModal v-model="modalRolAbierto" :titulo="rolEditando ? 'Renombrar rol' : 'Nuevo rol'">
      <BaseAlerta v-if="rolesStore.errorGuardado" tipo="error" class="mb-5">{{ rolesStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarGuardarRol">
        <BaseInput v-model="formularioRol.nombre" label="Nombre del rol" placeholder="RRHH Sede Norte" requerido />
        <BaseSelect v-if="!rolEditando" v-model="formularioRol.rolBase" label="Plantilla base" :opciones="OPCIONES_ROL_BASE" requerido />
        <BaseBoton tipo="submit" :cargando="rolesStore.guardando" class="mt-2">
          {{ rolEditando ? "Guardar cambios" : "Crear rol" }}
        </BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalPermisosAbierto" :titulo="`Permisos de ${rolPermisos?.nombre}`">
      <p class="mb-4 text-xs text-texto-sutil">
        Base: <strong class="text-texto">{{ ETIQUETAS_ROL_BASE[rolPermisos?.rolBase] }}</strong>
      </p>

      <h3 class="text-sm font-semibold text-texto">Lo que este rol puede hacer hoy</h3>
      <p class="mt-1 mb-3 text-xs text-texto-sutil">Plantilla base y excepciones ya combinadas — solo se listan los módulos con algún acceso.</p>

      <p v-if="rolesStore.cargandoPermisosEfectivos" class="mb-5 text-sm text-texto-sutil">Cargando…</p>
      <BaseAlerta v-else-if="rolesStore.errorPermisosEfectivos" tipo="error" class="mb-5">{{ rolesStore.errorPermisosEfectivos }}</BaseAlerta>
      <p v-else-if="modulosConAcceso.length === 0" class="mb-5 text-sm text-texto-sutil">Este rol no tiene acceso a ningún módulo todavía.</p>
      <ul v-else class="mb-6 flex flex-col gap-2.5 rounded-xl border border-borde bg-fondo p-4">
        <li v-for="item in modulosConAcceso" :key="item.modulo" class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-medium text-texto">{{ item.texto }}</span>
          <span
            v-for="accion in item.acciones"
            :key="accion"
            class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento"
          >
            {{ ETIQUETAS_ACCION[accion] }}
          </span>
        </li>
      </ul>

      <h3 class="border-t border-borde pt-5 text-sm font-semibold text-texto">Excepciones a la plantilla</h3>
      <p class="mt-1 mb-3 text-xs text-texto-sutil">Conceden o quitan una acción puntual sin cambiar la plantilla base — ya están incluidas en el resumen de arriba.</p>

      <BaseAlerta v-if="permisosStore.error" tipo="error" class="mb-5">{{ permisosStore.error }}</BaseAlerta>
      <BaseAlerta v-if="permisosStore.errorAccion" tipo="error" class="mb-5">{{ permisosStore.errorAccion }}</BaseAlerta>

      <p v-if="permisosStore.cargando" class="text-sm text-texto-sutil">Cargando…</p>
      <ul v-else-if="permisosStore.excepciones.length > 0" class="mb-6 flex flex-col divide-y divide-borde">
        <li v-for="excepcion in permisosStore.excepciones" :key="excepcion._id" class="flex items-center justify-between gap-3 py-3">
          <p class="text-sm text-texto">
            {{ ETIQUETAS_MODULO[excepcion.modulo] }} · {{ ETIQUETAS_ACCION[excepcion.accion] }} ·
            <span :class="excepcion.otorgado ? 'text-exito' : 'text-error'">{{ excepcion.otorgado ? "Concedido" : "Revocado" }}</span>
            · {{ ETIQUETAS_ALCANCE[excepcion.alcance] }}
          </p>
          <button
            type="button"
            class="shrink-0 rounded-lg p-2 text-texto-sutil transition-colors hover:bg-error-fondo hover:text-error"
            :aria-label="confirmandoExcepcionId === excepcion._id ? 'Confirmar eliminación' : 'Eliminar'"
            :title="confirmandoExcepcionId === excepcion._id ? 'Confirmar eliminación' : 'Eliminar'"
            @click="manejarEliminarExcepcion(excepcion)"
          >
            <PhTrash class="size-[16px]" :class="confirmandoExcepcionId === excepcion._id && 'text-error'" />
          </button>
        </li>
      </ul>
      <p v-else class="mb-6 text-sm text-texto-sutil">Este rol no tiene excepciones: usa el comportamiento por defecto de su plantilla.</p>

      <form class="flex flex-col gap-4 border-t border-borde pt-5" novalidate @submit.prevent="manejarOtorgarExcepcion">
        <p class="text-sm font-medium text-texto">Agregar excepción</p>
        <BaseAlerta v-if="permisosStore.errorGuardado" tipo="error">{{ permisosStore.errorGuardado }}</BaseAlerta>
        <BaseSelect v-model="formularioExcepcion.modulo" label="Módulo" :opciones="OPCIONES_MODULO" requerido />
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="formularioExcepcion.accion" label="Acción" :opciones="OPCIONES_ACCION" requerido />
          <BaseSelect v-model="formularioExcepcion.alcance" label="Alcance" :opciones="OPCIONES_ALCANCE" requerido />
        </div>
        <BaseSelect
          v-model="formularioExcepcion.otorgado"
          label="Efecto"
          :opciones="[
            { valor: 'true', texto: 'Conceder (permitir aunque el rol base no lo incluya)' },
            { valor: 'false', texto: 'Revocar (quitar aunque el rol base lo incluya)' },
          ]"
          requerido
        />
        <BaseBoton tipo="submit" variante="secundario" :cargando="permisosStore.guardando">Guardar excepción</BaseBoton>
      </form>
    </BaseModal>
  </div>
</template>
