import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import operadorReglaLegalServicio from "@/servicios/operadorReglaLegal.servicio";

export const useOperadorReglasLegalesStore = defineStore("operadorReglasLegales", () => {
  const reglas = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const creando = ref(false);
  const errorCreacion = ref(null);

  const filtros = reactive({ codigo: "", pais: "", estadoValidacion: "" });

  const paginaActual = ref(1);
  const paginacion = ref(null);
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.codigo) params.codigo = filtros.codigo;
      if (filtros.pais) params.pais = filtros.pais;
      if (filtros.estadoValidacion) params.estadoValidacion = filtros.estadoValidacion;
      const { data: respuesta } = await operadorReglaLegalServicio.listar(params);
      reglas.value = respuesta.data.reglas;
      paginacion.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarReglas() {
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

  async function crearVersion(datos) {
    creando.value = true;
    errorCreacion.value = null;
    try {
      const { data: respuesta } = await operadorReglaLegalServicio.crearVersion(datos);
      reglas.value.unshift(respuesta.data.regla);
      return true;
    } catch (err) {
      errorCreacion.value = err.mensaje;
      return false;
    } finally {
      creando.value = false;
    }
  }

  return {
    reglas,
    cargando,
    error,
    creando,
    errorCreacion,
    filtros,
    paginacion,
    limite,
    cargarReglas,
    cambiarLimite,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    crearVersion,
  };
});
