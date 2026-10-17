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
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value, ...filtrosActuales.value };
      const { data: respuesta } = await turnoServicio.listar(sedeSlugActual.value, params);
      turnos.value = respuesta.data.turnos;
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
      if (sedeSlugResumenActual.value) await obtenerPaginaResumen(); // refleja el nuevo conteo
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
      if (sedeSlugResumenActual.value) await obtenerPaginaResumen(); // refleja el nuevo conteo
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  // Resumen agrupado por empleado (1 renglón por empleado) — la vista principal de esta pantalla:
  // con horarios fijos generando turnos automáticamente, listar turno por turno no escala con
  // muchos empleados (ver TurnoRepository.resumenPorEmpleado en el backend). El detalle completo
  // de un empleado puntual sigue usando `turnos`/`cargarTurnos({empleadoId})` de arriba.
  const resumen = ref([]);
  const sedeSlugResumenActual = ref(null);
  const cargandoResumen = ref(false);
  const errorResumen = ref(null);

  const paginaResumenActual = ref(1);
  const paginacionResumen = ref(null);
  const limiteResumen = ref(10);

  async function obtenerPaginaResumen() {
    cargandoResumen.value = true;
    errorResumen.value = null;
    try {
      const { data: respuesta } = await turnoServicio.resumenPorEmpleado(sedeSlugResumenActual.value, {
        pagina: paginaResumenActual.value,
        limite: limiteResumen.value,
      });
      resumen.value = respuesta.data.resumen;
      paginacionResumen.value = respuesta.data.paginacion;
    } catch (err) {
      errorResumen.value = err.mensaje;
    } finally {
      cargandoResumen.value = false;
    }
  }

  async function cargarResumen(sedeSlug) {
    sedeSlugResumenActual.value = sedeSlug;
    paginaResumenActual.value = 1;
    await obtenerPaginaResumen();
  }

  async function cambiarLimiteResumen(nuevoLimite) {
    limiteResumen.value = nuevoLimite;
    paginaResumenActual.value = 1;
    await obtenerPaginaResumen();
  }

  async function irAPaginaSiguienteResumen() {
    if (!paginacionResumen.value?.hayPaginaSiguiente) return;
    paginaResumenActual.value += 1;
    await obtenerPaginaResumen();
  }

  async function irAPaginaAnteriorResumen() {
    if (!paginacionResumen.value?.hayPaginaAnterior) return;
    paginaResumenActual.value -= 1;
    await obtenerPaginaResumen();
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
    limite,
    cargarTurnos,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    cambiarLimite,
    crearTurno,
    actualizarTurno,
    anularTurno,
    resumen,
    cargandoResumen,
    errorResumen,
    paginacionResumen,
    limiteResumen,
    cargarResumen,
    cambiarLimiteResumen,
    irAPaginaSiguienteResumen,
    irAPaginaAnteriorResumen,
  };
});
