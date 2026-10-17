import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import notificacionServicio from "@/servicios/notificacion.servicio";

export const useNotificacionesStore = defineStore("notificaciones", () => {
  const propias = ref([]);
  const cargandoPropias = ref(false);
  const errorPropias = ref(null);
  const filtrosPropias = reactive({ estado: "", tipo: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón. Este store tiene DOS listados
  // independientes (propias/todas), así que cada uno lleva su propio par página/paginación.
  const paginaActualPropias = ref(1);
  const paginacionPropias = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limitePropias = ref(10);

  const noLeidas = ref(0);

  const errorAccion = ref(null);

  const todas = ref([]);
  const cargandoTodas = ref(false);
  const errorTodas = ref(null);
  const filtrosTodas = reactive({ destinatarioId: "", estado: "", tipo: "" });

  const paginaActualTodas = ref(1);
  const paginacionTodas = ref(null);
  // Tamaño de página independiente del de "propias" — cada listado maneja el suyo.
  const limiteTodas = ref(10);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  async function obtenerPaginaPropias() {
    cargandoPropias.value = true;
    errorPropias.value = null;
    try {
      const params = { pagina: paginaActualPropias.value, limite: limitePropias.value };
      if (filtrosPropias.estado) params.estado = filtrosPropias.estado;
      if (filtrosPropias.tipo) params.tipo = filtrosPropias.tipo;
      const { data: respuesta } = await notificacionServicio.listarPropias(params);
      propias.value = respuesta.data.notificaciones;
      paginacionPropias.value = respuesta.data.paginacion;
    } catch (err) {
      errorPropias.value = err.mensaje;
    } finally {
      cargandoPropias.value = false;
    }
  }

  // Punto de entrada público (montar la vista, cambiar un filtro): siempre vuelve a la página 1.
  async function cargarPropias() {
    paginaActualPropias.value = 1;
    await obtenerPaginaPropias();
  }

  async function cambiarLimitePropias(nuevoLimite) {
    limitePropias.value = nuevoLimite;
    paginaActualPropias.value = 1;
    await obtenerPaginaPropias();
  }

  async function irAPaginaSiguientePropias() {
    if (!paginacionPropias.value?.hayPaginaSiguiente) return;
    paginaActualPropias.value += 1;
    await obtenerPaginaPropias();
  }

  async function irAPaginaAnteriorPropias() {
    if (!paginacionPropias.value?.hayPaginaAnterior) return;
    paginaActualPropias.value -= 1;
    await obtenerPaginaPropias();
  }

  async function cargarNoLeidas() {
    try {
      const { data: respuesta } = await notificacionServicio.contarNoLeidas();
      noLeidas.value = respuesta.data.noLeidas;
    } catch {
      // Silencioso a propósito: el contador del sidebar no debe romper la navegación si falla.
    }
  }

  async function marcarLeida(notificacionId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await notificacionServicio.marcarLeida(notificacionId);
      const indice = propias.value.findIndex((item) => item._id === notificacionId);
      if (indice !== -1) propias.value[indice] = respuesta.data.notificacion;
      if (noLeidas.value > 0) noLeidas.value -= 1;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function obtenerPaginaTodas() {
    cargandoTodas.value = true;
    errorTodas.value = null;
    try {
      const params = { pagina: paginaActualTodas.value, limite: limiteTodas.value };
      if (filtrosTodas.destinatarioId) params.destinatarioId = filtrosTodas.destinatarioId;
      if (filtrosTodas.estado) params.estado = filtrosTodas.estado;
      if (filtrosTodas.tipo) params.tipo = filtrosTodas.tipo;
      const { data: respuesta } = await notificacionServicio.listarPorEmpresa(params);
      todas.value = respuesta.data.notificaciones;
      paginacionTodas.value = respuesta.data.paginacion;
    } catch (err) {
      errorTodas.value = err.mensaje;
    } finally {
      cargandoTodas.value = false;
    }
  }

  // Punto de entrada público (montar la vista, cambiar un filtro): siempre vuelve a la página 1.
  async function cargarTodas() {
    paginaActualTodas.value = 1;
    await obtenerPaginaTodas();
  }

  async function cambiarLimiteTodas(nuevoLimite) {
    limiteTodas.value = nuevoLimite;
    paginaActualTodas.value = 1;
    await obtenerPaginaTodas();
  }

  async function irAPaginaSiguienteTodas() {
    if (!paginacionTodas.value?.hayPaginaSiguiente) return;
    paginaActualTodas.value += 1;
    await obtenerPaginaTodas();
  }

  async function irAPaginaAnteriorTodas() {
    if (!paginacionTodas.value?.hayPaginaAnterior) return;
    paginaActualTodas.value -= 1;
    await obtenerPaginaTodas();
  }

  async function crearNotificacion(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await notificacionServicio.crear(datos);
      todas.value.unshift(respuesta.data.notificacion);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  return {
    propias,
    cargandoPropias,
    errorPropias,
    filtrosPropias,
    paginacionPropias,
    limitePropias,
    cargarPropias,
    irAPaginaSiguientePropias,
    irAPaginaAnteriorPropias,
    cambiarLimitePropias,
    noLeidas,
    cargarNoLeidas,
    errorAccion,
    marcarLeida,
    todas,
    cargandoTodas,
    errorTodas,
    filtrosTodas,
    paginacionTodas,
    limiteTodas,
    cargarTodas,
    irAPaginaSiguienteTodas,
    irAPaginaAnteriorTodas,
    cambiarLimiteTodas,
    guardando,
    errorGuardado,
    crearNotificacion,
  };
});
