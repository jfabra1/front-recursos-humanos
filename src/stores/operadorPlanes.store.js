import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import operadorPlanServicio from "@/servicios/operadorPlan.servicio";

export const useOperadorPlanesStore = defineStore("operadorPlanes", () => {
  // Lista completa SIN paginar: la usa el propio OperadorPanelVista.vue para el <select> de
  // plan al crear una empresa. El listado paginado de verdad (la lista que se muestra y se
  // navega) es un par de estado aparte, ver `planesPagina` más abajo.
  const planes = ref([]);
  const cargando = ref(false);
  const error = ref(null);
  const creando = ref(false);
  const errorCreacion = ref(null);

  const filtros = reactive({ nombre: "" });

  async function cargarPlanes() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await operadorPlanServicio.listar();
      planes.value = respuesta.data.planes;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la sección "Planes de suscripción" del panel de operador.
  const planesPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionPlanes = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limite = ref(10);

  async function obtenerPaginaPlanes() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await operadorPlanServicio.listar(params);
      planesPagina.value = respuesta.data.planes;
      paginacionPlanes.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarPaginaPlanes() {
    paginaActual.value = 1;
    await obtenerPaginaPlanes();
  }

  async function cambiarLimitePlanes(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPaginaPlanes();
  }

  async function irAPaginaSiguientePlanes() {
    if (!paginacionPlanes.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaPlanes();
  }

  async function irAPaginaAnteriorPlanes() {
    if (!paginacionPlanes.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaPlanes();
  }

  async function crearPlan(datosPlan) {
    creando.value = true;
    errorCreacion.value = null;
    try {
      const { data: respuesta } = await operadorPlanServicio.crear(datosPlan);
      planesPagina.value.push(respuesta.data.plan);
      planes.value.push(respuesta.data.plan); // mantiene el <select> de "crear empresa" al día sin recargar
      return true;
    } catch (err) {
      errorCreacion.value = err.mensaje;
      return false;
    } finally {
      creando.value = false;
    }
  }

  return {
    planes,
    cargando,
    error,
    creando,
    errorCreacion,
    filtros,
    cargarPlanes,
    planesPagina,
    paginacionPlanes,
    limite,
    cargarPaginaPlanes,
    irAPaginaSiguientePlanes,
    irAPaginaAnteriorPlanes,
    cambiarLimitePlanes,
    crearPlan,
  };
});
