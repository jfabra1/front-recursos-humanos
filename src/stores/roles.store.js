import { defineStore } from "pinia";
import { ref } from "vue";
import rolServicio from "@/servicios/rol.servicio";

export const useRolesStore = defineStore("roles", () => {
  const roles = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  // Resumen de solo lectura (plantilla base + excepciones ya combinadas) para la pantalla de
  // "Permisos" de un rol — no reemplaza la gestión de excepciones, solo la hace entendible:
  // sin esto, un rol sin excepciones no mostraba nada de lo que SÍ puede hacer por defecto.
  const permisosEfectivos = ref(null);
  const cargandoPermisosEfectivos = ref(false);
  const errorPermisosEfectivos = ref(null);

  async function cargarPermisosEfectivos(rolId) {
    cargandoPermisosEfectivos.value = true;
    errorPermisosEfectivos.value = null;
    permisosEfectivos.value = null;
    try {
      const { data: respuesta } = await rolServicio.obtenerPermisosEfectivos(rolId);
      permisosEfectivos.value = respuesta.data.permisos;
    } catch (err) {
      errorPermisosEfectivos.value = err.mensaje;
    } finally {
      cargandoPermisosEfectivos.value = false;
    }
  }

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await rolServicio.listar({ pagina: paginaActual.value, limite: limite.value });
      roles.value = respuesta.data.roles;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cambiarLimite(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPagina();
  }

  // Punto de entrada público (montar la vista): siempre vuelve a la página 1.
  async function cargarRoles() {
    paginaActual.value = 1;
    await obtenerPagina();
  }

  async function irAPaginaSiguiente() {
    if (!paginacion.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPagina();
  }

  async function irAPaginaAnterior() {
    if (!paginacion.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPagina();
  }

  async function crearRol(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await rolServicio.crear(datos);
      roles.value.unshift(respuesta.data.rol);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarRol(rolId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await rolServicio.actualizar(rolId, datos);
      const indice = roles.value.findIndex((rol) => rol._id === rolId);
      if (indice !== -1) roles.value[indice] = respuesta.data.rol;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularRol(rolId) {
    errorAccion.value = null;
    try {
      await rolServicio.anular(rolId);
      const indice = roles.value.findIndex((rol) => rol._id === rolId);
      if (indice !== -1) roles.value[indice].activo = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    roles,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    paginacion,
    limite,
    cargarRoles,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    cambiarLimite,
    crearRol,
    actualizarRol,
    anularRol,
    permisosEfectivos,
    cargandoPermisosEfectivos,
    errorPermisosEfectivos,
    cargarPermisosEfectivos,
  };
});
