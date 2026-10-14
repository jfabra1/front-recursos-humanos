import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import empleadoServicio from "@/servicios/empleado.servicio";

export const useEmpleadosStore = defineStore("empleados", () => {
  // Lista completa SIN paginar: la usa casi toda la app (selects de "elige un empleado",
  // resolver empleadoId → nombre en listados de otros módulos). Paginar esta lista rompería
  // esos usos en silencio (solo verían los primeros ~50 empleados) — por eso el listado
  // paginado de verdad es un par de estado aparte, ver `empleadosPagina` más abajo, exclusivo
  // de EmpleadosVista.vue (la única pantalla donde un humano navega la lista como tal).
  const empleados = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ activo: true, buscar: "" });

  async function cargarEmpleados() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { activo: filtros.activo };
      if (filtros.buscar) params.buscar = filtros.buscar;
      const { data: respuesta } = await empleadoServicio.listar(params);
      empleados.value = respuesta.data.empleados;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de empleados.
  const empleadosPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionEmpleados = ref(null);

  async function obtenerPaginaEmpleados() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, activo: filtros.activo };
      if (filtros.buscar) params.buscar = filtros.buscar;
      const { data: respuesta } = await empleadoServicio.listar(params);
      empleadosPagina.value = respuesta.data.empleados;
      paginacionEmpleados.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  // Punto de entrada público (montar la vista, cambiar un filtro): siempre vuelve a la página 1.
  async function cargarPaginaEmpleados() {
    paginaActual.value = 1;
    await obtenerPaginaEmpleados();
  }

  async function irAPaginaSiguienteEmpleados() {
    if (!paginacionEmpleados.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaEmpleados();
  }

  async function irAPaginaAnteriorEmpleados() {
    if (!paginacionEmpleados.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaEmpleados();
  }

  async function crearEmpleado(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await empleadoServicio.crear(datos);
      if (filtros.activo) empleadosPagina.value.unshift(respuesta.data.empleado);
      empleados.value.unshift(respuesta.data.empleado); // mantiene los <select> que usan esta lista al día sin recargar
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarEmpleado(empleadoId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await empleadoServicio.actualizar(empleadoId, datos);
      const indice = empleadosPagina.value.findIndex((empleado) => empleado._id === empleadoId);
      if (indice !== -1) empleadosPagina.value[indice] = respuesta.data.empleado;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function darDeBajaEmpleado(empleadoId) {
    errorAccion.value = null;
    try {
      await empleadoServicio.darDeBaja(empleadoId);
      empleadosPagina.value = empleadosPagina.value.filter((empleado) => empleado._id !== empleadoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function recontratarEmpleado(empleadoAnteriorId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      await empleadoServicio.recontratar(empleadoAnteriorId, datos);
      empleadosPagina.value = empleadosPagina.value.filter((empleado) => empleado._id !== empleadoAnteriorId);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  return {
    empleados,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    filtros,
    cargarEmpleados,
    empleadosPagina,
    paginacionEmpleados,
    cargarPaginaEmpleados,
    irAPaginaSiguienteEmpleados,
    irAPaginaAnteriorEmpleados,
    crearEmpleado,
    actualizarEmpleado,
    darDeBajaEmpleado,
    recontratarEmpleado,
  };
});
