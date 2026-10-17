import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import plantillaContratoServicio from "@/servicios/plantillaContrato.servicio";

export const usePlantillaContratoStore = defineStore("plantillaContrato", () => {
  // Lista completa SIN paginar: la usa EmpleadosVista.vue para poblar el <select> de plantilla
  // al solicitar una firma. El listado paginado de verdad es un par aparte, ver `plantillasPagina`
  // más abajo, exclusivo de PlantillasContratoVista.vue.
  const plantillas = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  const descargandoId = ref(null);
  const errorDescargar = ref(null);

  const creandoEjemplos = ref(false);
  const errorEjemplos = ref(null);

  const variables = ref([]);

  const filtros = reactive({ nombre: "" });

  async function cargarPlantillas() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await plantillaContratoServicio.listar();
      plantillas.value = respuesta.data.plantillas;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarVariables() {
    if (variables.value.length > 0) return;
    try {
      const { data: respuesta } = await plantillaContratoServicio.variables();
      variables.value = respuesta.data.variables;
    } catch {
      // Es solo una ayuda visual para el editor — si falla, el formulario sigue siendo usable.
    }
  }

  // Listado paginado — exclusivo de la pantalla de administración de plantillas.
  const plantillasPagina = ref([]);
  const paginaActual = ref(1);
  const paginacionPlantillas = ref(null);
  const limite = ref(10);

  async function obtenerPaginaPlantillas() {
    cargando.value = true;
    error.value = null;
    try {
      const params = { pagina: paginaActual.value, limite: limite.value };
      if (filtros.nombre) params.nombre = filtros.nombre;
      const { data: respuesta } = await plantillaContratoServicio.listar(params);
      plantillasPagina.value = respuesta.data.plantillas;
      paginacionPlantillas.value = respuesta.data.paginacion;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarPaginaPlantillas() {
    paginaActual.value = 1;
    await obtenerPaginaPlantillas();
  }

  async function cambiarLimitePlantillas(nuevoLimite) {
    limite.value = nuevoLimite;
    paginaActual.value = 1;
    await obtenerPaginaPlantillas();
  }

  async function irAPaginaSiguientePlantillas() {
    if (!paginacionPlantillas.value?.hayPaginaSiguiente) return;
    paginaActual.value += 1;
    await obtenerPaginaPlantillas();
  }

  async function irAPaginaAnteriorPlantillas() {
    if (!paginacionPlantillas.value?.hayPaginaAnterior) return;
    paginaActual.value -= 1;
    await obtenerPaginaPlantillas();
  }

  async function crearPlantilla(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await plantillaContratoServicio.crear(datos);
      plantillasPagina.value.unshift(respuesta.data.plantilla);
      plantillas.value.unshift(respuesta.data.plantilla);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function actualizarPlantilla(plantillaId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await plantillaContratoServicio.actualizar(plantillaId, datos);
      const actualizarEn = (lista) => {
        const indice = lista.findIndex((plantilla) => plantilla._id === plantillaId);
        if (indice !== -1) lista[indice] = respuesta.data.plantilla;
      };
      actualizarEn(plantillasPagina.value);
      actualizarEn(plantillas.value);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularPlantilla(plantillaId) {
    errorAccion.value = null;
    try {
      await plantillaContratoServicio.anular(plantillaId);
      plantillasPagina.value = plantillasPagina.value.filter((plantilla) => plantilla._id !== plantillaId);
      plantillas.value = plantillas.value.filter((plantilla) => plantilla._id !== plantillaId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  // Idempotente del lado del backend: si ya existen (por nombre), no las duplica — se puede
  // llamar varias veces sin miedo (ej. si el usuario ya eliminó una y quiere recuperarla).
  async function crearEjemplos() {
    creandoEjemplos.value = true;
    errorEjemplos.value = null;
    try {
      const { data: respuesta } = await plantillaContratoServicio.crearEjemplos();
      plantillasPagina.value.unshift(...respuesta.data.plantillas);
      plantillas.value.unshift(...respuesta.data.plantillas);
      return respuesta.data.plantillas;
    } catch (err) {
      errorEjemplos.value = err.mensaje;
      return [];
    } finally {
      creandoEjemplos.value = false;
    }
  }

  // Descarga directa (sin SolicitudFirma): para imprimir y firmar a mano — ver nota en
  // PlantillaContratoService.generarPdf del backend. `contratoId` es opcional: sin él es solo
  // una vista previa en blanco de la plantilla.
  async function descargarPdf(plantilla, contratoId) {
    descargandoId.value = plantilla._id;
    errorDescargar.value = null;
    try {
      const respuesta = await plantillaContratoServicio.generarPdf(plantilla._id, contratoId);
      const disposicion = respuesta.headers["content-disposition"] ?? "";
      const nombreArchivo = /filename="(.+)"/.exec(disposicion)?.[1] || `${plantilla.nombre}.pdf`;

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
    plantillas,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    descargandoId,
    errorDescargar,
    descargarPdf,
    creandoEjemplos,
    errorEjemplos,
    crearEjemplos,
    variables,
    filtros,
    cargarPlantillas,
    cargarVariables,
    plantillasPagina,
    paginacionPlantillas,
    limite,
    cargarPaginaPlantillas,
    cambiarLimitePlantillas,
    irAPaginaSiguientePlantillas,
    irAPaginaAnteriorPlantillas,
    crearPlantilla,
    actualizarPlantilla,
    anularPlantilla,
  };
});
