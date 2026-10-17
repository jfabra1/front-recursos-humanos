import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import instrumentoColectivoServicio from "@/servicios/instrumentoColectivo.servicio";

export const useInstrumentosColectivosStore = defineStore("instrumentosColectivos", () => {
  // Lista completa SIN paginar: la usa EmpleadosVista.vue para poblar el <select> de convención
  // colectiva al crear/editar un empleado. El listado paginado de verdad es un par de estado
  // aparte, ver `instrumentosPagina` más abajo, exclusivo de InstrumentosColectivosVista.vue.
  const instrumentos = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ nombre: "" });

  async function cargarInstrumentos() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await instrumentoColectivoServicio.listar();
      instrumentos.value = respuesta.data.instrumentos;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de instrumentos colectivos.
  const instrumentosPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionInstrumentos = ref(null);
  const limite = ref(10);

  async function obtenerPaginaInstrumentos() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await instrumentoColectivoServicio.listar(params);
      instrumentosPagina.value = respuesta.data.instrumentos;
      paginacionInstrumentos.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarPaginaInstrumentos() {
    paginaActual.value = 1;
    await obtenerPaginaInstrumentos();
  }

  async function cambiarLimiteInstrumentos(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPaginaInstrumentos();
  }

  async function irAPaginaSiguienteInstrumentos() {
    if (!paginacionInstrumentos.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaInstrumentos();
  }

  async function irAPaginaAnteriorInstrumentos() {
    if (!paginacionInstrumentos.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaInstrumentos();
  }

  async function crearInstrumento(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await instrumentoColectivoServicio.crear(datos);
      instrumentosPagina.value.unshift(respuesta.data.instrumento);
      instrumentos.value.unshift(respuesta.data.instrumento); // mantiene el <select> que lo usa al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularInstrumento(instrumentoId) {
    errorAccion.value = null;
    try {
      await instrumentoColectivoServicio.anular(instrumentoId);
      const indicePagina = instrumentosPagina.value.findIndex((instrumento) => instrumento._id === instrumentoId);
      if (indicePagina !== -1) instrumentosPagina.value[indicePagina].activo = false;
      const indiceLookup = instrumentos.value.findIndex((instrumento) => instrumento._id === instrumentoId);
      if (indiceLookup !== -1) instrumentos.value[indiceLookup].activo = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    instrumentos,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    filtros,
    cargarInstrumentos,
    instrumentosPagina,
    paginacionInstrumentos,
    limite,
    cargarPaginaInstrumentos,
    cambiarLimiteInstrumentos,
    irAPaginaSiguienteInstrumentos,
    irAPaginaAnteriorInstrumentos,
    crearInstrumento,
    anularInstrumento,
  };
});
