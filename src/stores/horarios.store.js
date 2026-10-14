import { defineStore } from "pinia";
import { ref } from "vue";
import horarioServicio from "@/servicios/horario.servicio";

export const useHorariosStore = defineStore("horarios", () => {
  // Lista completa SIN paginar: la usa `TurnosVista.vue` para poblar el <select> de horarios
  // al crear/editar un turno. El listado paginado de verdad es un par de estado aparte, ver
  // `horariosPagina` más abajo, exclusivo de HorariosVista.vue.
  const horarios = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  async function cargarHorarios() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await horarioServicio.listar();
      horarios.value = respuesta.data.horarios;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de horarios.
  const horariosPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionHorarios = ref(null);

  async function obtenerPaginaHorarios() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await horarioServicio.listar({ pagina: paginaActual.value });
      horariosPagina.value = respuesta.data.horarios;
      paginacionHorarios.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Punto de entrada público (montar la vista): siempre vuelve a la página 1.
  async function cargarPaginaHorarios() {
    paginaActual.value = 1;
    await obtenerPaginaHorarios();
  }

  async function irAPaginaSiguienteHorarios() {
    if (!paginacionHorarios.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaHorarios();
  }

  async function irAPaginaAnteriorHorarios() {
    if (!paginacionHorarios.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaHorarios();
  }

  async function crearHorario(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await horarioServicio.crear(datos);
      horariosPagina.value.unshift(respuesta.data.horario);
      horarios.value.unshift(respuesta.data.horario); // mantiene los <select> que usan esta lista al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarHorario(horarioId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await horarioServicio.actualizar(horarioId, datos);
      const indice = horariosPagina.value.findIndex((horario) => horario._id === horarioId);
      if (indice !== -1) horariosPagina.value[indice] = respuesta.data.horario;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularHorario(horarioId) {
    errorAccion.value = null;
    try {
      await horarioServicio.anular(horarioId);
      const indice = horariosPagina.value.findIndex((horario) => horario._id === horarioId);
      if (indice !== -1) horariosPagina.value[indice].activo = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    horarios,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    cargarHorarios,
    horariosPagina,
    paginacionHorarios,
    cargarPaginaHorarios,
    irAPaginaSiguienteHorarios,
    irAPaginaAnteriorHorarios,
    crearHorario,
    actualizarHorario,
    anularHorario,
  };
});
