import { defineStore } from "pinia";
import { ref } from "vue";
import asignacionHorarioServicio from "@/servicios/asignacionHorario.servicio";

export const useAsignacionHorarioStore = defineStore("asignacionHorario", () => {
  const asignaciones = ref([]);
  const sedeSlugActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const generandoId = ref(null);
  const errorGenerar = ref(null);
  const resultadoGenerar = ref(null);

  // Mismo patrón que turnos.store.js: sede-scoped, recuerda los últimos filtros para que
  // avanzar/retroceder página no los pierda.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  const filtrosActuales = ref({});
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value, ...filtrosActuales.value };
      const { data: respuesta } = await asignacionHorarioServicio.listar(sedeSlugActual.value, params);
      asignaciones.value = respuesta.data.asignaciones;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarAsignaciones(sedeSlug, filtros = {}) {
    sedeSlugActual.value = sedeSlug;
    filtrosActuales.value = filtros;
    paginaActual.value = 1;
    await obtenerPagina();
  }

  async function cambiarLimite(nuevoLimite) {
    limite.value = nuevoLimite;
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

  async function crearAsignacion(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await asignacionHorarioServicio.crear(sedeSlugActual.value, datos);
      asignaciones.value.unshift(respuesta.data.asignacion);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularAsignacion(asignacionId) {
    errorAccion.value = null;
    try {
      await asignacionHorarioServicio.anular(sedeSlugActual.value, asignacionId);
      const indice = asignaciones.value.findIndex((asignacion) => asignacion._id === asignacionId);
      if (indice !== -1) asignaciones.value[indice].activa = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function generarTurnos(asignacionId, diasHaciaAdelante) {
    generandoId.value = asignacionId;
    errorGenerar.value = null;
    resultadoGenerar.value = null;
    try {
      const { data: respuesta } = await asignacionHorarioServicio.generarTurnos(
        sedeSlugActual.value,
        asignacionId,
        diasHaciaAdelante ? { diasHaciaAdelante } : {},
      );
      resultadoGenerar.value = { asignacionId, ...respuesta.data };
      return true;
    } catch (err) {
      errorGenerar.value = err.mensaje;
      return false;
    } finally {
      generandoId.value = null;
    }
  }

  return {
    asignaciones,
    sedeSlugActual,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    generandoId,
    errorGenerar,
    resultadoGenerar,
    paginacion,
    limite,
    cargarAsignaciones,
    cambiarLimite,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    crearAsignacion,
    anularAsignacion,
    generarTurnos,
  };
});
