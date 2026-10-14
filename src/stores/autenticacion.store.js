import { defineStore } from "pinia";
import { ref, computed } from "vue";
import autenticacionServicio from "@/servicios/autenticacion.servicio";
import permisosEfectivosServicio from "@/servicios/permisosEfectivos.servicio";

export const useAutenticacionStore = defineStore("autenticacion", () => {
  const usuario = ref(null);
  const accessToken = ref(null);
  const empresaSlug = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  // Matriz real (base del rol + excepciones de PermisoPersonalizado) que devuelve el
  // backend en `/mis-permisos`. `usePermisos.js` lee de aquí — nunca de una copia
  // estática en el frontend, para que las excepciones que configure cada empresa se
  // reflejen de verdad en la UI.
  const permisosEfectivos = ref(null);

  const estaAutenticado = computed(() => Boolean(accessToken.value));

  function establecerSesion({ accessToken: token, empresaSlug: slug, usuario: datosUsuario }) {
    accessToken.value = token;
    empresaSlug.value = slug;
    usuario.value = datosUsuario;
  }

  function limpiarSesion() {
    accessToken.value = null;
    empresaSlug.value = null;
    usuario.value = null;
    permisosEfectivos.value = null;
  }

  // Silenciosa a propósito: si falla, `puede()` simplemente devuelve false en todos
  // lados (oculta todo) en vez de romper el flujo de login/restauración de sesión.
  async function cargarPermisosEfectivos() {
    try {
      const { data: respuesta } = await permisosEfectivosServicio.obtenerMios();
      permisosEfectivos.value = respuesta.data.permisos;
    } catch {
      permisosEfectivos.value = null;
    }
  }

  async function iniciarSesion(credenciales) {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await autenticacionServicio.iniciarSesion(credenciales);
      establecerSesion(respuesta.data);
      await cargarPermisosEfectivos();
      return true;
    } catch (err) {
      error.value = err.mensaje;
      return false;
    } finally {
      cargando.value = false;
    }
  }

  // Intenta recuperar la sesión al cargar la app usando la cookie httpOnly del refresh
  // token (si existe). Silenciosa: si falla, el usuario simplemente ve el login.
  async function restaurarSesion() {
    try {
      const { data: respuesta } = await autenticacionServicio.refrescarToken();
      establecerSesion(respuesta.data);
      await cargarPermisosEfectivos();
      return true;
    } catch {
      limpiarSesion();
      return false;
    }
  }

  async function cerrarSesion() {
    try {
      await autenticacionServicio.cerrarSesion();
    } finally {
      limpiarSesion();
    }
  }

  return {
    usuario,
    accessToken,
    empresaSlug,
    cargando,
    error,
    permisosEfectivos,
    estaAutenticado,
    iniciarSesion,
    restaurarSesion,
    cerrarSesion,
  };
});
