import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import cartaRenunciaServicio from "@/servicios/cartaRenuncia.servicio";

export const useCartaRenunciaStore = defineStore("cartaRenuncia", () => {
  // --- Autoservicio (empleado): su propia carta, si existe ---------------------------------

  const propia = ref(null);
  const cargandoPropia = ref(false);
  const errorPropia = ref(null);

  const guardando = ref(false);
  const errorGuardar = ref(null);

  const enviando = ref(false);
  const errorEnviar = ref(null);

  async function cargarPropia() {
    cargandoPropia.value = true;
    errorPropia.value = null;
    try {
      const { data: respuesta } = await cartaRenunciaServicio.obtenerPropia();
      propia.value = respuesta.data.carta;
    } catch (err) {
      errorPropia.value = err.mensaje;
    } finally {
      cargandoPropia.value = false;
    }
  }

  async function crearBorrador(datos) {
    guardando.value = true;
    errorGuardar.value = null;
    try {
      const { data: respuesta } = await cartaRenunciaServicio.crearBorrador(datos);
      propia.value = respuesta.data.carta;
      return true;
    } catch (err) {
      errorGuardar.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarBorrador(cartaId, datos) {
    guardando.value = true;
    errorGuardar.value = null;
    try {
      const { data: respuesta } = await cartaRenunciaServicio.actualizarBorrador(cartaId, datos);
      propia.value = respuesta.data.carta;
      return true;
    } catch (err) {
      errorGuardar.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function retirarBorrador(cartaId) {
    guardando.value = true;
    errorGuardar.value = null;
    try {
      await cartaRenunciaServicio.retirarBorrador(cartaId);
      propia.value = null;
      return true;
    } catch (err) {
      errorGuardar.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function enviarAFirma(cartaId) {
    enviando.value = true;
    errorEnviar.value = null;
    try {
      await cartaRenunciaServicio.enviarAFirma(cartaId);
      await cargarPropia();
      return true;
    } catch (err) {
      errorEnviar.value = err.mensaje;
      return false;
    } finally {
      enviando.value = false;
    }
  }

  // --- Administración (RR. HH./admin): listado paginado de todas las cartas ------------------

  const cartas = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const filtros = reactive({ estado: "" });
  const paginaActual = ref(1);
  const paginacion = ref(null);
  const limite = ref(10);

  const errorAccion = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.estado) params.estado = filtros.estado;
      const { data: respuesta } = await cartaRenunciaServicio.listar(params);
      cartas.value = respuesta.data.cartas;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarCartas() {
    paginaActual.value = 1;
    await obtenerPagina();
  }

  async function cambiarLimite(nuevoLimite) {
    limite.value = nuevoLimite;
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

  async function anular(cartaId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await cartaRenunciaServicio.anular(cartaId);
      const indice = cartas.value.findIndex((carta) => carta._id === cartaId);
      if (indice !== -1) cartas.value[indice] = respuesta.data.carta;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    propia,
    cargandoPropia,
    errorPropia,
    guardando,
    errorGuardar,
    enviando,
    errorEnviar,
    cargarPropia,
    crearBorrador,
    actualizarBorrador,
    retirarBorrador,
    enviarAFirma,
    cartas,
    cargando,
    error,
    filtros,
    paginacion,
    limite,
    errorAccion,
    cargarCartas,
    cambiarLimite,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    anular,
  };
});
