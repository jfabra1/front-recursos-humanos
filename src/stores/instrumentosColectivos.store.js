import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import instrumentoColectivoServicio from "@/servicios/instrumentoColectivo.servicio";

export const useInstrumentosColectivosStore = defineStore("instrumentosColectivos", () => {
  const instrumentos = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ nombre: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón. Este store no se reutiliza como
  // lookup en ninguna otra vista, así que no necesita un par de estado sin paginar aparte.
  const paginaActual = ref(1);
  const paginacion = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await instrumentoColectivoServicio.listar(params);
      instrumentos.value = respuesta.data.instrumentos;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarInstrumentos() {
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

  async function crearInstrumento(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await instrumentoColectivoServicio.crear(datos);
      instrumentos.value.unshift(respuesta.data.instrumento);
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
      const indice = instrumentos.value.findIndex((instrumento) => instrumento._id === instrumentoId);
      if (indice !== -1) instrumentos.value[indice].activo = false;
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
    paginacion,
    cargarInstrumentos,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    crearInstrumento,
    anularInstrumento,
  };
});
