import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import incidenciaAsistenciaServicio from "@/servicios/incidenciaAsistencia.servicio";

export const useIncidenciasAsistenciaStore = defineStore("incidenciasAsistencia", () => {
  const incidencias = ref([]);
  const sedeSlugActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ estado: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.estado) params.estado = filtros.estado;
      const { data: respuesta } = await incidenciaAsistenciaServicio.listar(sedeSlugActual.value, params);
      incidencias.value = respuesta.data.incidencias;
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

  // Punto de entrada público (montar la vista, cambiar sede o filtro): siempre vuelve a la página 1.
  async function cargarIncidencias(sedeSlug) {
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

  async function marcarEnRevision(incidenciaId) {
    errorAccion.value = null;
    try {
      await incidenciaAsistenciaServicio.marcarEnRevision(sedeSlugActual.value, incidenciaId);
      const indice = incidencias.value.findIndex((incidencia) => incidencia._id === incidenciaId);
      if (indice !== -1) incidencias.value[indice].estado = "en_revision";
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function resolver(incidenciaId) {
    errorAccion.value = null;
    try {
      await incidenciaAsistenciaServicio.resolver(sedeSlugActual.value, incidenciaId);
      const indice = incidencias.value.findIndex((incidencia) => incidencia._id === incidenciaId);
      if (indice !== -1) incidencias.value[indice].estado = "resuelta";
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    incidencias,
    sedeSlugActual,
    cargando,
    error,
    errorAccion,
    filtros,
    paginacion,
    limite,
    cargarIncidencias,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    cambiarLimite,
    marcarEnRevision,
    resolver,
  };
});
