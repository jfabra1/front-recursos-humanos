import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import areaServicio from "@/servicios/area.servicio";

export const useAreasStore = defineStore("areas", () => {
  // Lista completa SIN paginar: la usa CargosVista.vue para poblar el <select> de área y
  // AreasVista.vue para el <select> de área superior. El listado paginado de verdad es un par
  // de estado aparte, ver `areasPagina` más abajo, exclusivo de AreasVista.vue (su propia lista).
  const areas = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ nombre: "" });

  async function cargarAreas() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await areaServicio.listar();
      areas.value = respuesta.data.areas;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de áreas.
  const areasPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionAreas = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limite = ref(10);

  async function obtenerPaginaAreas() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await areaServicio.listar(params);
      areasPagina.value = respuesta.data.areas;
      paginacionAreas.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarPaginaAreas() {
    paginaActual.value = 1;
    await obtenerPaginaAreas();
  }

  async function cambiarLimiteAreas(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPaginaAreas();
  }

  async function irAPaginaSiguienteAreas() {
    if (!paginacionAreas.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaAreas();
  }

  async function irAPaginaAnteriorAreas() {
    if (!paginacionAreas.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaAreas();
  }

  async function crearArea(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await areaServicio.crear(datos);
      areasPagina.value.unshift(respuesta.data.area);
      areas.value.unshift(respuesta.data.area); // mantiene los <select> que usan esta lista al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarArea(areaId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await areaServicio.actualizar(areaId, datos);
      const indice = areasPagina.value.findIndex((area) => area._id === areaId);
      if (indice !== -1) areasPagina.value[indice] = respuesta.data.area;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularArea(areaId) {
    errorAccion.value = null;
    try {
      await areaServicio.anular(areaId);
      const indice = areasPagina.value.findIndex((area) => area._id === areaId);
      if (indice !== -1) areasPagina.value[indice].activo = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    areas,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    filtros,
    cargarAreas,
    areasPagina,
    paginacionAreas,
    limite,
    cargarPaginaAreas,
    irAPaginaSiguienteAreas,
    irAPaginaAnteriorAreas,
    cambiarLimiteAreas,
    crearArea,
    actualizarArea,
    anularArea,
  };
});
