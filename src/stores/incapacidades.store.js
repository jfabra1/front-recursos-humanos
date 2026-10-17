import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import incapacidadServicio from "@/servicios/incapacidad.servicio";

export const useIncapacidadesStore = defineStore("incapacidades", () => {
  const incapacidades = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ empleadoId: "", tipoOrigen: "", estado: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.empleadoId) params.empleadoId = filtros.empleadoId;
      if (filtros.tipoOrigen) params.tipoOrigen = filtros.tipoOrigen;
      if (filtros.estado) params.estado = filtros.estado;
      const { data: respuesta } = await incapacidadServicio.listar(params);
      incapacidades.value = respuesta.data.incapacidades;
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

  // Punto de entrada público (montar la vista, cambiar un filtro): siempre vuelve a la página 1.
  async function cargarIncapacidades() {
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

  async function crearIncapacidad(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await incapacidadServicio.crear(datos);
      incapacidades.value.unshift(respuesta.data.incapacidad);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function cambiarEstado(incapacidadId, estado) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await incapacidadServicio.cambiarEstado(incapacidadId, estado);
      const indice = incapacidades.value.findIndex((item) => item._id === incapacidadId);
      if (indice !== -1) incapacidades.value[indice] = respuesta.data.incapacidad;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    incapacidades,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    filtros,
    paginacion,
    limite,
    cargarIncapacidades,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    cambiarLimite,
    crearIncapacidad,
    cambiarEstado,
  };
});
