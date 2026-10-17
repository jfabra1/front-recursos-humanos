import { defineStore } from "pinia";
import { ref } from "vue";
import marcacionServicio from "@/servicios/marcacion.servicio";

export const useMarcacionesStore = defineStore("marcaciones", () => {
  const marcaciones = ref([]);
  const sedeSlugActual = ref(null);
  const filtrosActuales = ref({});
  const cargando = ref(false);
  const error = ref(null);

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  const limite = ref(10);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value, ...filtrosActuales.value };
      const { data: respuesta } = await marcacionServicio.listar(sedeSlugActual.value, params);
      marcaciones.value = respuesta.data.marcaciones;
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

  // Punto de entrada público (montar la vista, cambiar sede o filtro): siempre vuelve a la página 1.
  async function cargarMarcaciones(sedeSlug, filtros = {}) {
    sedeSlugActual.value = sedeSlug;
    filtrosActuales.value = filtros;
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

  return { marcaciones, cargando, error, paginacion, limite, cargarMarcaciones, irAPaginaSiguiente, irAPaginaAnterior, cambiarLimite };
});
