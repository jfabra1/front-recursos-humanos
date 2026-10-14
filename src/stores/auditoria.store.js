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

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value };
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

  return { registros, cargando, error, filtros, paginacion, cargarRegistros, irAPaginaSiguiente, irAPaginaAnterior };
});
