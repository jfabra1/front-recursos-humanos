import { defineStore } from "pinia";
import { ref } from "vue";
import usuarioServicio from "@/servicios/usuario.servicio";

export const useUsuariosStore = defineStore("usuarios", () => {
  // Lista completa SIN paginar: la usan otras vistas solo para resolver usuarioId → email
  // (Auditoría, Vacaciones/Permisos/HoraExtra al mostrar quién dio la primera aprobación,
  // Reportes, Notificaciones). El listado paginado de verdad es un par de estado aparte, ver
  // `usuariosPagina` más abajo, exclusivo de UsuariosVista.vue.
  const usuarios = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  async function cargarUsuarios() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await usuarioServicio.listar();
      usuarios.value = respuesta.data.usuarios;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de usuarios.
  const usuariosPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionUsuarios = ref(null);

  async function obtenerPaginaUsuarios() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await usuarioServicio.listar({ pagina: paginaActual.value });
      usuariosPagina.value = respuesta.data.usuarios;
      paginacionUsuarios.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Punto de entrada público (montar la vista): siempre vuelve a la página 1.
  async function cargarPaginaUsuarios() {
    paginaActual.value = 1;
    await obtenerPaginaUsuarios();
  }

  async function irAPaginaSiguienteUsuarios() {
    if (!paginacionUsuarios.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaUsuarios();
  }

  async function irAPaginaAnteriorUsuarios() {
    if (!paginacionUsuarios.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaUsuarios();
  }

  async function crearUsuario(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await usuarioServicio.crear(datos);
      usuariosPagina.value.unshift(respuesta.data.usuario);
      usuarios.value.unshift(respuesta.data.usuario); // mantiene los lookups (email por usuarioId) al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarUsuario(usuarioObjetivoId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await usuarioServicio.actualizar(usuarioObjetivoId, datos);
      const indice = usuariosPagina.value.findIndex((usuario) => usuario._id === usuarioObjetivoId);
      if (indice !== -1) usuariosPagina.value[indice] = respuesta.data.usuario;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function restablecerPassword(usuarioObjetivoId, nuevaPassword) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      await usuarioServicio.restablecerPassword(usuarioObjetivoId, nuevaPassword);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  return {
    usuarios,
    cargando,
    error,
    guardando,
    errorGuardado,
    cargarUsuarios,
    usuariosPagina,
    paginacionUsuarios,
    cargarPaginaUsuarios,
    irAPaginaSiguienteUsuarios,
    irAPaginaAnteriorUsuarios,
    crearUsuario,
    actualizarUsuario,
    restablecerPassword,
  };
});
