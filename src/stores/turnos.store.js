import { defineStore } from "pinia";
import { ref } from "vue";
import turnoServicio from "@/servicios/turno.servicio";

export const useTurnosStore = defineStore("turnos", () => {
  const turnos = ref([]);
  const sedeSlugActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón. Este store es sede-scoped, así que
  // además de la página se recuerdan los últimos filtros para que avanzar/retroceder página
  // no pierda el filtro activo.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  const filtrosActuales = ref({});

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, ...filtrosActuales.value };
      const { data: respuesta } = await turnoServicio.listar(sedeSlugActual.value, params);
      turnos.value = respuesta.data.turnos;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Punto de entrada público (montar la vista, cambiar de sede o de filtro): siempre vuelve a
  // la página 1.
  async function cargarTurnos(sedeSlug, filtros = {}) {
    sedeSlugActual.value = sedeSlug;
    filtrosActuales.value = filtros;
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

  async function crearTurno(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await turnoServicio.crear(sedeSlugActual.value, datos);
      turnos.value.unshift(respuesta.data.turno);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarTurno(turnoId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await turnoServicio.actualizar(sedeSlugActual.value, turnoId, datos);
      const indice = turnos.value.findIndex((turno) => turno._id === turnoId);
      if (indice !== -1) turnos.value[indice] = respuesta.data.turno;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularTurno(turnoId) {
    errorAccion.value = null;
    try {
      await turnoServicio.anular(sedeSlugActual.value, turnoId);
      turnos.value = turnos.value.filter((turno) => turno._id !== turnoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    turnos,
    sedeSlugActual,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    paginacion,
    cargarTurnos,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    crearTurno,
    actualizarTurno,
    anularTurno,
  };
});
