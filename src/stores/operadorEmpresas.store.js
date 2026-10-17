import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import operadorEmpresaServicio from "@/servicios/operadorEmpresa.servicio";

export const useOperadorEmpresasStore = defineStore("operadorEmpresas", () => {
  const empresas = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const filtros = reactive({ estado: "", planId: "", buscar: "" });

  const paginaActual = ref(1);
  const paginacion = ref(null);
  const limite = ref(10);

  const creando = ref(false);
  const errorCreacion = ref(null);
  const empresaCreada = ref(null);

  const actualizandoEstado = ref(false);
  const errorActualizacion = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.planId) params.planId = filtros.planId;
      if (filtros.buscar) params.buscar = filtros.buscar;
      const { data: respuesta } = await operadorEmpresaServicio.listar(params);
      empresas.value = respuesta.data.empresas;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarEmpresas() {
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

  async function crearEmpresa(datosEmpresa) {
    creando.value = true;
    errorCreacion.value = null;
    empresaCreada.value = null;
    try {
      const { data: respuesta } = await operadorEmpresaServicio.crear(datosEmpresa);
      empresaCreada.value = respuesta.data;
      return true;
    } catch (err) {
      errorCreacion.value = err.mensaje;
      return false;
    } finally {
      creando.value = false;
    }
  }

  // La respuesta de suspender/reactivar solo trae {id, estado} (no la empresa completa) — se
  // actualiza el estado en el listado local en vez de volver a pedir toda la página.
  function actualizarEstadoLocal(empresaId, estado) {
    const indice = empresas.value.findIndex((empresa) => empresa._id === empresaId);
    if (indice !== -1) empresas.value[indice].estado = estado;
  }

  async function suspenderEmpresa(empresaId, motivo) {
    actualizandoEstado.value = true;
    errorActualizacion.value = null;
    try {
      const { data: respuesta } = await operadorEmpresaServicio.suspender(empresaId, motivo);
      actualizarEstadoLocal(respuesta.data.empresa.id, respuesta.data.empresa.estado);
      return true;
    } catch (err) {
      errorActualizacion.value = err.mensaje;
      return false;
    } finally {
      actualizandoEstado.value = false;
    }
  }

  async function reactivarEmpresa(empresaId) {
    actualizandoEstado.value = true;
    errorActualizacion.value = null;
    try {
      const { data: respuesta } = await operadorEmpresaServicio.reactivar(empresaId);
      actualizarEstadoLocal(respuesta.data.empresa.id, respuesta.data.empresa.estado);
      return true;
    } catch (err) {
      errorActualizacion.value = err.mensaje;
      return false;
    } finally {
      actualizandoEstado.value = false;
    }
  }

  return {
    empresas,
    cargando,
    error,
    filtros,
    paginacion,
    limite,
    cargarEmpresas,
    cambiarLimite,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    creando,
    errorCreacion,
    empresaCreada,
    crearEmpresa,
    actualizandoEstado,
    errorActualizacion,
    suspenderEmpresa,
    reactivarEmpresa,
  };
});
