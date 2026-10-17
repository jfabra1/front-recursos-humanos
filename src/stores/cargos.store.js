import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import cargoServicio from "@/servicios/cargo.servicio";

export const useCargosStore = defineStore("cargos", () => {
  // Lista completa SIN paginar: la usa EmpleadosVista.vue para poblar el <select> de cargo al
  // crear/editar un empleado. El listado paginado de verdad es un par de estado aparte, ver
  // `cargosPagina` más abajo, exclusivo de CargosVista.vue (su propia lista).
  const cargos = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ nombre: "" });

  async function cargarCargos() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await cargoServicio.listar();
      cargos.value = respuesta.data.cargos;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de cargos.
  const cargosPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionCargos = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limite = ref(10);

  async function obtenerPaginaCargos() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await cargoServicio.listar(params);
      cargosPagina.value = respuesta.data.cargos;
      paginacionCargos.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarPaginaCargos() {
    paginaActual.value = 1;
    await obtenerPaginaCargos();
  }

  async function cambiarLimiteCargos(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPaginaCargos();
  }

  async function irAPaginaSiguienteCargos() {
    if (!paginacionCargos.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaCargos();
  }

  async function irAPaginaAnteriorCargos() {
    if (!paginacionCargos.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaCargos();
  }

  async function crearCargo(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await cargoServicio.crear(datos);
      cargosPagina.value.unshift(respuesta.data.cargo);
      cargos.value.unshift(respuesta.data.cargo); // mantiene los <select> que usan esta lista al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarCargo(cargoId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await cargoServicio.actualizar(cargoId, datos);
      const indice = cargosPagina.value.findIndex((cargo) => cargo._id === cargoId);
      if (indice !== -1) cargosPagina.value[indice] = respuesta.data.cargo;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularCargo(cargoId) {
    errorAccion.value = null;
    try {
      await cargoServicio.anular(cargoId);
      const indice = cargosPagina.value.findIndex((cargo) => cargo._id === cargoId);
      if (indice !== -1) cargosPagina.value[indice].activo = false;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    cargos,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    filtros,
    cargarCargos,
    cargosPagina,
    paginacionCargos,
    limite,
    cargarPaginaCargos,
    irAPaginaSiguienteCargos,
    irAPaginaAnteriorCargos,
    cambiarLimiteCargos,
    crearCargo,
    actualizarCargo,
    anularCargo,
  };
});
