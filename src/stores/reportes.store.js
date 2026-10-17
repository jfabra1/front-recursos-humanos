import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import reporteServicio from "@/servicios/reporte.servicio";

export const useReportesStore = defineStore("reportes", () => {
  const exportaciones = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const filtros = reactive({ tipo: "", generadoPor: "" });

  // La paginación es obligatoria y siempre viene del backend (nunca se recorta localmente):
  // ver auditoria.store.js para la referencia del patrón.
  const paginaActual = ref(1);
  const paginacion = ref(null);
  // Tamaño de página: lo controla el usuario desde BasePaginacion (opciones 10/20/50/100),
  // nunca se recorta en el frontend — siempre se vuelve a pedir al backend con el nuevo valor.
  const limite = ref(10);

  const generando = ref(false);
  const errorGenerar = ref(null);

  const descargandoId = ref(null);
  const errorDescargar = ref(null);

  async function obtenerPagina() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.generadoPor) params.generadoPor = filtros.generadoPor;
      const { data: respuesta } = await reporteServicio.listar(params);
      exportaciones.value = respuesta.data.exportaciones;
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
  async function cargarExportaciones() {
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

  async function generarReporte(datos) {
    generando.value = true;
    errorGenerar.value = null;
    try {
      const { data: respuesta } = await reporteServicio.generar(datos);
      exportaciones.value.unshift(respuesta.data.exportacion);
      return true;
    } catch (err) {
      errorGenerar.value = err.mensaje;
      return false;
    } finally {
      generando.value = false;
    }
  }

  // Descarga autenticada: el archivo vive detrás de la API (no es una URL pública), así que no
  // alcanza con un <a href>. Se pide como blob con el token ya puesto por clienteHttp y se
  // dispara la descarga localmente con un object URL efímero.
  async function descargarExportacion(exportacion) {
    descargandoId.value = exportacion._id;
    errorDescargar.value = null;
    try {
      const respuesta = await reporteServicio.descargar(exportacion._id);
      const disposicion = respuesta.headers["content-disposition"] ?? "";
      const nombreArchivo = /filename="(.+)"/.exec(disposicion)?.[1] || `${exportacion.tipo}.csv`;

      const url = URL.createObjectURL(respuesta.data);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      errorDescargar.value = err.mensaje;
      return false;
    } finally {
      descargandoId.value = null;
    }
  }

  return {
    exportaciones,
    cargando,
    error,
    filtros,
    paginacion,
    limite,
    cargarExportaciones,
    irAPaginaSiguiente,
    irAPaginaAnterior,
    cambiarLimite,
    generando,
    errorGenerar,
    generarReporte,
    descargandoId,
    errorDescargar,
    descargarExportacion,
  };
});
