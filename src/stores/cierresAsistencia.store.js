import { defineStore } from "pinia";
import { ref } from "vue";
import cierreAsistenciaServicio from "@/servicios/cierreAsistencia.servicio";

export const useCierresAsistenciaStore = defineStore("cierresAsistencia", () => {
  const cierres = ref([]);
  const sedeSlugActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const procesando = ref(false);
  const errorAccion = ref(null);

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await cierreAsistenciaServicio.listar(sedeSlugActual.value, { pagina: paginaActual.value });
      cierres.value = respuesta.data.cierres;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Punto de entrada público (montar la vista, cambiar sede): siempre vuelve a la página 1.
  async function cargarCierres(sedeSlug) {
    sedeSlugActual.value = sedeSlug;
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

  async function crearCierre(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await cierreAsistenciaServicio.crear(sedeSlugActual.value, datos);
      cierres.value.unshift(respuesta.data.cierre);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function calcularTotales(cierreId) {
    procesando.value = true;
    errorAccion.value = null;
    try {
      const { data: respuesta } = await cierreAsistenciaServicio.calcularTotales(sedeSlugActual.value, cierreId);
      const indice = cierres.value.findIndex((cierre) => cierre._id === cierreId);
      if (indice !== -1) cierres.value[indice] = respuesta.data.cierre;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    } finally {
      procesando.value = false;
    }
  }

  async function avanzarEstado(cierreId, estado) {
    procesando.value = true;
    errorAccion.value = null;
    try {
      const { data: respuesta } = await cierreAsistenciaServicio.avanzarEstado(sedeSlugActual.value, cierreId, estado);
      const indice = cierres.value.findIndex((cierre) => cierre._id === cierreId);
      if (indice !== -1) cierres.value[indice] = respuesta.data.cierre;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    } finally {
      procesando.value = false;
    }
  }

  return {
    cierres,
    sedeSlugActual,
    cargando,
    error,
    guardando,
    errorGuardado,
    procesando,
    errorAccion,
    cargarCierres,
    crearCierre,
    calcularTotales,
    avanzarEstado,
  };
});
