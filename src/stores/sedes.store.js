import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import sedeServicio from "@/servicios/sede.servicio";

export const useSedesStore = defineStore("sedes", () => {
  // Lista completa SIN paginar: la usan otras vistas (Áreas, Empleados) para poblar un <select>
  // de sedes. El listado paginado de verdad es un par de estado aparte, ver `sedesPagina` más
  // abajo, exclusivo de SedesVista.vue.
  const sedes = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ nombre: "" });

  async function cargarSedes() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await sedeServicio.listar();
      sedes.value = respuesta.data.sedes;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de sedes.
  const sedesPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionSedes = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limite = ref(10);

  async function obtenerPaginaSedes() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await sedeServicio.listar(params);
      sedesPagina.value = respuesta.data.sedes;
      paginacionSedes.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarPaginaSedes() {
    paginaActual.value = 1;
    await obtenerPaginaSedes();
  }

  async function cambiarLimiteSedes(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPaginaSedes();
  }

  async function irAPaginaSiguienteSedes() {
    if (!paginacionSedes.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaSedes();
  }

  async function irAPaginaAnteriorSedes() {
    if (!paginacionSedes.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaSedes();
  }

  async function crearSede(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await sedeServicio.crear(datos);
      sedesPagina.value.unshift(respuesta.data.sede);
      sedes.value.unshift(respuesta.data.sede); // mantiene los <select> que usan esta lista al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarSede(sedeId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await sedeServicio.actualizar(sedeId, datos);
      const indice = sedesPagina.value.findIndex((sede) => sede._id === sedeId);
      if (indice !== -1) sedesPagina.value[indice] = respuesta.data.sede;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularSede(sedeId) {
    errorAccion.value = null;
    try {
      await sedeServicio.anular(sedeId);
      const indice = sedesPagina.value.findIndex((sede) => sede._id === sedeId);
      if (indice !== -1) sedesPagina.value[indice].activo = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    sedes,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    filtros,
    cargarSedes,
    sedesPagina,
    paginacionSedes,
    limite,
    cargarPaginaSedes,
    irAPaginaSiguienteSedes,
    irAPaginaAnteriorSedes,
    cambiarLimiteSedes,
    crearSede,
    actualizarSede,
    anularSede,
  };
});
