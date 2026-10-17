<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { PhIdentificationBadge, PhKey, PhPencilSimple, PhUserPlus, PhUsers } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import { useUsuariosStore } from "@/stores/usuarios.store";
import { useRolesStore } from "@/stores/roles.store";
import { useEmpleadosStore } from "@/stores/empleados.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";
import { ETIQUETAS_ESTADO } from "@/utils/empleado.util";

const usuariosStore = useUsuariosStore();
const rolesStore = useRolesStore();
const empleadosStore = useEmpleadosStore();
const { puede } = usePermisos();

onMounted(() => {
  usuariosStore.cargarPaginaUsuarios();
  if (rolesStore.roles.length === 0) rolesStore.cargarRoles();
  if (empleadosStore.empleados.length === 0) empleadosStore.cargarEmpleados();
});

const opcionesRoles = computed(() => rolesStore.roles.filter((rol) => rol.activo).map((rol) => ({ valor: rol._id, texto: rol.nombre })));
const opcionesEmpleados = computed(() =>
  empleadosStore.empleados.map((empleado) => ({ valor: empleado._id, texto: `${empleado.personaId.nombres} ${empleado.personaId.apellidos}` })),
);

function empleadoDeUsuario(usuario) {
  if (!usuario?.empleadoId) return undefined;
  return empleadosStore.empleados.find((empleado) => empleado._id === usuario.empleadoId);
}

// Modal empleado vinculado
const modalEmpleadoAbierto = ref(false);
const usuarioEmpleado = ref(null);

function abrirEmpleado(usuario) {
  usuarioEmpleado.value = usuario;
  modalEmpleadoAbierto.value = true;
}

// Modal crear/editar usuario
const modalUsuarioAbierto = ref(false);
const usuarioEditando = ref(null);
const formularioUsuario = reactive({ email: "", password: "", rolId: "", empleadoId: "", estado: "activo" });

function abrirCrear() {
  usuarioEditando.value = null;
  Object.assign(formularioUsuario, { email: "", password: "", rolId: "", empleadoId: "", estado: "activo" });
  modalUsuarioAbierto.value = true;
}

function abrirEditar(usuario) {
  usuarioEditando.value = usuario;
  Object.assign(formularioUsuario, { email: usuario.email, password: "", rolId: usuario.rolId._id, empleadoId: "", estado: usuario.estado });
  modalUsuarioAbierto.value = true;
}

async function manejarGuardarUsuario() {
  const exito = usuarioEditando.value
    ? await usuariosStore.actualizarUsuario(usuarioEditando.value._id, { rolId: formularioUsuario.rolId, estado: formularioUsuario.estado })
    : await usuariosStore.crearUsuario({
        email: formularioUsuario.email,
        password: formularioUsuario.password,
        rolId: formularioUsuario.rolId,
        ...(formularioUsuario.empleadoId ? { empleadoId: formularioUsuario.empleadoId } : {}),
      });
  if (exito) modalUsuarioAbierto.value = false;
}

// Modal restablecer contraseña
const modalPasswordAbierto = ref(false);
const usuarioPassword = ref(null);
const nuevaPassword = ref("");

function abrirRestablecerPassword(usuario) {
  usuarioPassword.value = usuario;
  nuevaPassword.value = "";
  modalPasswordAbierto.value = true;
}

async function manejarRestablecerPassword() {
  if (await usuariosStore.restablecerPassword(usuarioPassword.value._id, nuevaPassword.value)) {
    modalPasswordAbierto.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-texto">Usuarios</h1>
        <p class="mt-1.5 text-sm text-texto-sutil">Cuentas con acceso al sistema y su rol asignado.</p>
      </div>
      <BaseBoton v-if="puede(MODULOS.USUARIO, ACCIONES.CREAR)" ancho="auto" @click="abrirCrear">
        <PhUserPlus class="size-4" weight="bold" />
        Nuevo usuario
      </BaseBoton>
    </div>

    <BaseAlerta v-if="usuariosStore.error" tipo="error" class="mt-6">{{ usuariosStore.error }}</BaseAlerta>

    <p v-if="usuariosStore.cargando" class="mt-8 text-sm text-texto-sutil">Cargando usuarios…</p>

    <div v-else-if="usuariosStore.usuariosPagina.length === 0" class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte py-16 text-center">
      <PhUsers class="size-6 text-texto-sutil" />
      <p class="text-sm text-texto-sutil">Aún no hay usuarios registrados.</p>
    </div>

    <ul v-else class="mt-6 flex flex-col divide-y divide-borde rounded-2xl border border-borde bg-fondo-elevado">
      <li v-for="usuario in usuariosStore.usuariosPagina" :key="usuario._id" class="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <div class="flex items-center gap-2.5">
            <p class="text-sm font-medium text-texto">{{ usuario.email }}</p>
            <span class="rounded-full bg-acento/10 px-2 py-0.5 text-xs font-medium text-acento">{{ usuario.rolId?.nombre }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="usuario.estado === 'activo' ? 'bg-exito/10 text-exito' : 'bg-error-fondo text-error'"
            >
              {{ usuario.estado === "activo" ? "Activo" : "Bloqueado" }}
            </span>
          </div>
          <p v-if="puede(MODULOS.EMPLEADO, ACCIONES.LEER)" class="mt-0.5 text-xs text-texto-sutil">
            {{ empleadoDeUsuario(usuario) ? `${empleadoDeUsuario(usuario).personaId.nombres} ${empleadoDeUsuario(usuario).personaId.apellidos}` : "Sin empleado vinculado" }}
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="puede(MODULOS.EMPLEADO, ACCIONES.LEER) && empleadoDeUsuario(usuario)"
            type="button"
            class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
            aria-label="Ver empleado"
            title="Ver empleado vinculado"
            @click="abrirEmpleado(usuario)"
          >
            <PhIdentificationBadge class="size-[18px]" />
          </button>
          <template v-if="puede(MODULOS.USUARIO, ACCIONES.EDITAR)">
            <button
              type="button"
              class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
              aria-label="Restablecer contraseña"
              title="Restablecer contraseña"
              @click="abrirRestablecerPassword(usuario)"
            >
              <PhKey class="size-[18px]" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-texto-sutil transition-colors hover:bg-fondo hover:text-texto"
              aria-label="Editar"
              title="Editar"
              @click="abrirEditar(usuario)"
            >
              <PhPencilSimple class="size-[18px]" />
            </button>
          </template>
        </div>
      </li>
    </ul>

    <BasePaginacion
      v-if="usuariosStore.paginacionUsuarios"
      :paginacion="usuariosStore.paginacionUsuarios"
      :limite="usuariosStore.limite"
      @anterior="usuariosStore.irAPaginaAnteriorUsuarios"
      @siguiente="usuariosStore.irAPaginaSiguienteUsuarios"
      @cambiar-limite="usuariosStore.cambiarLimiteUsuarios"
    />

    <BaseModal v-model="modalUsuarioAbierto" :titulo="usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'">
      <BaseAlerta v-if="usuariosStore.errorGuardado" tipo="error" class="mb-5">{{ usuariosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarGuardarUsuario">
        <template v-if="!usuarioEditando">
          <BaseInput v-model="formularioUsuario.email" type="email" label="Correo electrónico" placeholder="persona@empresa.com" requerido />
          <BaseInput
            v-model="formularioUsuario.password"
            type="password"
            label="Contraseña inicial"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            requerido
          />
          <BaseSelect
            v-model="formularioUsuario.empleadoId"
            label="Vincular a un empleado (opcional)"
            :opciones="opcionesEmpleados"
            placeholder="Sin vincular (caso administrador puro)"
          />
        </template>

        <BaseSelect v-model="formularioUsuario.rolId" label="Rol" :opciones="opcionesRoles" requerido />
        <BaseSelect
          v-if="usuarioEditando"
          v-model="formularioUsuario.estado"
          label="Estado"
          :opciones="[
            { valor: 'activo', texto: 'Activo' },
            { valor: 'bloqueado', texto: 'Bloqueado' },
          ]"
          requerido
        />

        <BaseBoton tipo="submit" :cargando="usuariosStore.guardando" class="mt-2">
          {{ usuarioEditando ? "Guardar cambios" : "Crear usuario" }}
        </BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalPasswordAbierto" :titulo="`Restablecer contraseña de ${usuarioPassword?.email}`">
      <BaseAlerta v-if="usuariosStore.errorGuardado" tipo="error" class="mb-5">{{ usuariosStore.errorGuardado }}</BaseAlerta>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="manejarRestablecerPassword">
        <BaseInput
          v-model="nuevaPassword"
          type="password"
          label="Nueva contraseña"
          placeholder="Mínimo 8 caracteres"
          autocomplete="new-password"
          requerido
        />
        <BaseBoton tipo="submit" :cargando="usuariosStore.guardando" class="mt-1">Restablecer</BaseBoton>
      </form>
    </BaseModal>

    <BaseModal v-model="modalEmpleadoAbierto" titulo="Empleado vinculado">
      <template v-if="usuarioEmpleado && empleadoDeUsuario(usuarioEmpleado)">
        <dl class="flex flex-col gap-3 text-sm">
          <div>
            <dt class="text-xs text-texto-sutil">Nombre</dt>
            <dd class="mt-0.5 text-texto">
              {{ empleadoDeUsuario(usuarioEmpleado).personaId.nombres }} {{ empleadoDeUsuario(usuarioEmpleado).personaId.apellidos }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-texto-sutil">Documento</dt>
            <dd class="mt-0.5 text-texto">{{ empleadoDeUsuario(usuarioEmpleado).personaId.numeroDocumento }}</dd>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <dt class="text-xs text-texto-sutil">Sede</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDeUsuario(usuarioEmpleado).sedeId?.nombre || "—" }}</dd>
            </div>
            <div>
              <dt class="text-xs text-texto-sutil">Cargo</dt>
              <dd class="mt-0.5 text-texto">{{ empleadoDeUsuario(usuarioEmpleado).cargoId?.nombre || "—" }}</dd>
            </div>
          </div>
          <div>
            <dt class="text-xs text-texto-sutil">Estado</dt>
            <dd class="mt-0.5">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="empleadoDeUsuario(usuarioEmpleado).estado === 'activo' ? 'bg-exito/10 text-exito' : 'bg-error-fondo text-error'"
              >
                {{ ETIQUETAS_ESTADO[empleadoDeUsuario(usuarioEmpleado).estado] }}
              </span>
            </dd>
          </div>
        </dl>
      </template>
      <p v-else class="text-sm text-texto-sutil">Este usuario no tiene ningún empleado vinculado.</p>
    </BaseModal>
  </div>
</template>
