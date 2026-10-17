import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import auditoriaServicio from "@/servicios/auditoria.servicio";

export const useAuditoriaStore = defineStore("auditoria", () => {
  const registros = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const filtros = reactive({ entidad: "", accion: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // `pagina` se manda siempre, así que la respuesta siempre trae `paginacion` (ver
  // RegistroAuditoriaController.listar — la rama sin `pagina` solo existe para otros
  // consumidores de la API, no para este panel).
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
      if (filtros.entidad) params.entidad = filtros.entidad;
      if (filtros.accion) params.accion = filtros.accion;
      const { data: respuesta } = await auditoriaServicio.listar(params);
      registros.value = respuesta.data.registros;
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

  // Punto de entrada público (montar la vista, cambiar un filtro): siempre vuelve a la página 1,
  // porque un filtro nuevo invalida la posición anterior (podría ya no existir esa página).
  async function cargarRegistros() {
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

  // Segundo listado independiente: la trazabilidad de UNA entidad puntual (ej. "este empleado"),
  // usada desde botones de "Trazabilidad" en otras vistas — no comparte estado con el listado
  // general de arriba, para no pisar los filtros/página que el usuario tenga en Auditoría.
  const registrosEntidad = ref([]);
  const cargandoEntidad = ref(false);
  const errorEntidad = ref(null);
  const entidadActual = ref(null);
  const entidadIdActual = ref(null);

  const paginaActualEntidad = ref(1);
  const paginacionEntidad = ref(null);
  const limiteEntidad = ref(10);

  async function obtenerPaginaEntidad() {
    cargandoEntidad.value = true;
    errorEntidad.value = null;
    try {
      const params = {
        pagina: paginaActualEntidad.value,
        limite: limiteEntidad.value,
        entidad: entidadActual.value,
        entidadId: entidadIdActual.value,
      };
      const { data: respuesta } = await auditoriaServicio.listar(params);
      registrosEntidad.value = respuesta.data.registros;
      paginacionEntidad.value = respuesta.data.paginacion;
    } catch (err) {
      errorEntidad.value = err.mensaje;
    } finally {
      cargandoEntidad.value = false;
    }
  }

  async function cargarPorEntidad(entidad, entidadId) {
    entidadActual.value = entidad;
    entidadIdActual.value = entidadId;
    paginaActualEntidad.value = 1;
    await obtenerPaginaEntidad();
  }

  async function cambiarLimiteEntidad(nuevoLimite) {
    limiteEntidad.value = nuevoLimite;
    paginaActualEntidad.value = 1;
    await obtenerPaginaEntidad();
  }

  async function irAPaginaSiguienteEntidad() {
    if (!paginacionEntidad.value?.hayPaginaSiguiente) return;
    paginaActualEntidad.value += 1;
    await obtenerPaginaEntidad();
  }

  async function irAPaginaAnteriorEntidad() {
    if (!paginacionEntidad.value?.hayPaginaAnterior) return;
    paginaActualEntidad.value -= 1;
    await obtenerPaginaEntidad();
  }

  return {
    registros,
    cargando,
    error,
    filtros,
    paginacion,
    limite,
    cargarRegistros,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    cambiarLimite,
    registrosEntidad,
    cargandoEntidad,
    errorEntidad,
    paginacionEntidad,
    limiteEntidad,
    cargarPorEntidad,
    cambiarLimiteEntidad,
    irAPaginaSiguienteEntidad,
    irAPaginaAnteriorEntidad,
  };
});
