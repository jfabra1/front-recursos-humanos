import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import vacacionesServicio from "@/servicios/vacaciones.servicio";

export const useVacacionesStore = defineStore("vacaciones", () => {
  const solicitudes = ref([]);
  const cargando = ref(false);
  const error = ref(null);
  const errorAccion = ref(null);

  const filtros = reactive({ empleadoId: "", estado: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);

  const saldo = ref(null);
  const movimientos = ref([]);
  const empleadoIdSaldoActual = ref(null);
  const cargandoSaldo = ref(false);
  const errorSaldo = ref(null);

  const causando = ref(false);
  const errorCausar = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value };
      if (filtros.empleadoId) params.empleadoId = filtros.empleadoId;
      if (filtros.estado) params.estado = filtros.estado;
      const { data: respuesta } = await vacacionesServicio.listar(params);
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

  function reemplazarSolicitud(solicitud) {
    const indice = solicitudes.value.findIndex((item) => item._id === solicitud._id);
    if (indice !== -1) solicitudes.value[indice] = solicitud;
  }

  async function consultarSaldo(empleadoId) {
    empleadoIdSaldoActual.value = empleadoId;
    cargandoSaldo.value = true;
    errorSaldo.value = null;
    saldo.value = null;
    movimientos.value = [];
    try {
      const [{ data: respuestaSaldo }, { data: respuestaMovimientos }] = await Promise.all([
        vacacionesServicio.obtenerSaldo(empleadoId),
        vacacionesServicio.listarMovimientos(empleadoId),
      ]);
      saldo.value = respuestaSaldo.data.saldo;
      movimientos.value = respuestaMovimientos.data.movimientos;
    } catch (err) {
      // 404 = el empleado todavía no tiene saldo causado: es un estado normal, no un error real.
      if (err.statusCode !== 404) errorSaldo.value = err.mensaje;
    } finally {
      cargandoSaldo.value = false;
    }
  }

  async function refrescarSaldoSiCorresponde(empleadoId) {
    if (empleadoIdSaldoActual.value === empleadoId) await consultarSaldo(empleadoId);
  }

  async function causarSaldo(empleadoId, fechaCorte) {
    causando.value = true;
    errorCausar.value = null;
    try {
      await vacacionesServicio.causar(empleadoId, fechaCorte);
      await refrescarSaldoSiCorresponde(empleadoId);
      return true;
    } catch (err) {
      errorCausar.value = err.mensaje;
      return false;
    } finally {
      causando.value = false;
    }
  }

  async function aprobar(solicitudId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await vacacionesServicio.aprobar(solicitudId);
      reemplazarSolicitud(respuesta.data.solicitud);
      await refrescarSaldoSiCorresponde(respuesta.data.solicitud.empleadoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function rechazar(solicitudId) {
    errorAccion.value = null;
    try {
      await vacacionesServicio.rechazar(solicitudId);
      // Este endpoint no devuelve la solicitud actualizada: se refleja el cambio localmente.
      const indice = solicitudes.value.findIndex((item) => item._id === solicitudId);
      if (indice !== -1) solicitudes.value[indice] = { ...solicitudes.value[indice], estado: "rechazada" };
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function cancelar(solicitudId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await vacacionesServicio.cancelar(solicitudId);
      reemplazarSolicitud(respuesta.data.solicitud);
      await refrescarSaldoSiCorresponde(respuesta.data.solicitud.empleadoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    solicitudes,
    cargando,
    error,
    errorAccion,
    filtros,
    paginacion,
    saldo,
    movimientos,
    empleadoIdSaldoActual,
    cargandoSaldo,
    errorSaldo,
    causando,
    errorCausar,
    cargarSolicitudes,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    consultarSaldo,
    causarSaldo,
    aprobar,
    rechazar,
    cancelar,
  };
});
