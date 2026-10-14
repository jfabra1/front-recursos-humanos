import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import solicitudHoraExtraServicio from "@/servicios/solicitudHoraExtra.servicio";

export const useSolicitudesHoraExtraStore = defineStore("solicitudesHoraExtra", () => {
  const solicitudes = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const errorAccion = ref(null);

  const conciliando = ref(false);
  const errorConciliacion = ref(null);
  const resultadoConciliacion = ref(undefined); // undefined = sin intentar todavía; null = "nada que conciliar"

  const filtros = reactive({ estadoAutorizacion: "", empleadoId: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value };
      if (filtros.estadoAutorizacion) params.estadoAutorizacion = filtros.estadoAutorizacion;
      if (filtros.empleadoId) params.empleadoId = filtros.empleadoId;
      const { data: respuesta } = await solicitudHoraExtraServicio.listar(params);
      solicitudes.value = respuesta.data.solicitudes;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Punto de entrada público (montar la vista, cambiar un filtro): siempre vuelve a la página 1.
  async function cargarSolicitudes() {
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

  async function aprobar(solicitudId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await solicitudHoraExtraServicio.aprobar(solicitudId);
      const indice = solicitudes.value.findIndex((solicitud) => solicitud._id === solicitudId);
      if (indice !== -1) solicitudes.value[indice] = respuesta.data.solicitud;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function rechazar(solicitudId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await solicitudHoraExtraServicio.rechazar(solicitudId);
      const indice = solicitudes.value.findIndex((solicitud) => solicitud._id === solicitudId);
      if (indice !== -1) solicitudes.value[indice] = respuesta.data.solicitud;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function conciliar(empleadoId, fecha) {
    conciliando.value = true;
    errorConciliacion.value = null;
    resultadoConciliacion.value = undefined;
    try {
      const { data: respuesta } = await solicitudHoraExtraServicio.conciliar(empleadoId, fecha);
      resultadoConciliacion.value = respuesta.data.solicitud;
      if (respuesta.data.solicitud) {
        const indice = solicitudes.value.findIndex((solicitud) => solicitud._id === respuesta.data.solicitud._id);
        if (indice !== -1) solicitudes.value[indice] = respuesta.data.solicitud;
        else solicitudes.value.unshift(respuesta.data.solicitud);
      }
      return true;
    } catch (err) {
      errorConciliacion.value = err.mensaje;
      return false;
    } finally {
      conciliando.value = false;
    }
  }

  return {
    solicitudes,
    cargando,
    error,
    errorAccion,
    conciliando,
    errorConciliacion,
    resultadoConciliacion,
    filtros,
    paginacion,
    cargarSolicitudes,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    aprobar,
    rechazar,
    conciliar,
  };
});
