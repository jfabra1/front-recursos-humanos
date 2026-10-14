import { defineStore } from "pinia";
import { ref } from "vue";
import documentoServicio from "@/servicios/documento.servicio";

export const useDocumentosStore = defineStore("documentos", () => {
  const documentos = ref([]);
  const empleadoIdActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  async function cargarDocumentos(empleadoId) {
    empleadoIdActual.value = empleadoId;
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await documentoServicio.listarPorEmpleado(empleadoId);
      documentos.value = respuesta.data.documentos;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function crearDocumento(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await documentoServicio.crear(datos);
      documentos.value.unshift(respuesta.data.documento);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function anularDocumento(documentoId) {
    errorAccion.value = null;
    try {
      await documentoServicio.anular(documentoId);
      documentos.value = documentos.value.filter((documento) => documento._id !== documentoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return { documentos, empleadoIdActual, cargando, error, guardando, errorGuardado, errorAccion, cargarDocumentos, crearDocumento, anularDocumento };
});
