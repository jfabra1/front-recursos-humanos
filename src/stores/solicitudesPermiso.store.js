import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import solicitudPermisoServicio from "@/servicios/solicitudPermiso.servicio";

export const useSolicitudesPermisoStore = defineStore("solicitudesPermiso", () => {
  const solicitudes = ref([]);
  const cargando = ref(false);
  const error = ref(null);
  const errorAccion = ref(null);

  const filtros = reactive({ empleadoId: "", tipo: "", estado: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value };
      if (filtros.empleadoId) params.empleadoId = filtros.empleadoId;
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.estado) params.estado = filtros.estado;
      const { data: respuesta } = await solicitudPermisoServicio.listar(params);
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
      const { data: respuesta } = await solicitudPermisoServicio.aprobar(solicitudId);
      const indice = solicitudes.value.findIndex((item) => item._id === solicitudId);
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
      const { data: respuesta } = await solicitudPermisoServicio.rechazar(solicitudId);
      const indice = solicitudes.value.findIndex((item) => item._id === solicitudId);
      if (indice !== -1) solicitudes.value[indice] = respuesta.data.solicitud;
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
    cargarSolicitudes,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    aprobar,
    rechazar,
  };
});
