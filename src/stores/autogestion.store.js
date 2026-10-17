import { defineStore } from "pinia";
import { ref } from "vue";
import autogestionServicio from "@/servicios/autogestion.servicio";

export const useAutogestionStore = defineStore("autogestion", () => {
  const empleado = ref(null);
  const contratoVigente = ref(null);
  const cargandoPerfil = ref(false);
  const errorPerfil = ref(null);

  const documentos = ref([]);
  const cargandoDocumentos = ref(false);
  const errorDocumentos = ref(null);

  const turnos = ref([]);
  const cargandoTurnos = ref(false);
  const errorTurnos = ref(null);

  const politica = ref(null);
  const cargandoPolitica = ref(false);
  const errorPolitica = ref(null);

  const firmasPendientes = ref([]);
  const cargandoFirmas = ref(false);
  const errorFirmas = ref(null);

  // Object URL del PDF en vista (ver patrón de descarga de reportes): se revoca antes de pedir
  // el siguiente, para no acumular blobs en memoria mientras el empleado navega entre documentos.
  const documentoFirmaUrl = ref(null);
  const cargandoDocumentoFirma = ref(false);
  const errorDocumentoFirma = ref(null);

  const firmando = ref(false);
  const errorFirmar = ref(null);

  async function cargarPerfil() {
    cargandoPerfil.value = true;
    errorPerfil.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.obtenerPerfil();
      empleado.value = respuesta.data.empleado;
      contratoVigente.value = respuesta.data.contratoVigente;
    } catch (err) {
      errorPerfil.value = err.mensaje;
    } finally {
      cargandoPerfil.value = false;
    }
  }

  async function cargarDocumentos() {
    cargandoDocumentos.value = true;
    errorDocumentos.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.listarDocumentos();
      documentos.value = respuesta.data.documentos;
    } catch (err) {
      errorDocumentos.value = err.mensaje;
    } finally {
      cargandoDocumentos.value = false;
    }
  }

  async function cargarTurnos(filtros = {}) {
    cargandoTurnos.value = true;
    errorTurnos.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.listarTurnos(filtros);
      turnos.value = respuesta.data.turnos;
    } catch (err) {
      errorTurnos.value = err.mensaje;
    } finally {
      cargandoTurnos.value = false;
    }
  }

  async function cargarPolitica() {
    cargandoPolitica.value = true;
    errorPolitica.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.obtenerPrivacidad();
      politica.value = respuesta.data.politica;
    } catch (err) {
      errorPolitica.value = err.mensaje;
    } finally {
      cargandoPolitica.value = false;
    }
  }

  async function cargarFirmasPendientes() {
    cargandoFirmas.value = true;
    errorFirmas.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.listarFirmasPendientes();
      firmasPendientes.value = respuesta.data.solicitudes;
    } catch (err) {
      errorFirmas.value = err.mensaje;
    } finally {
      cargandoFirmas.value = false;
    }
  }

  async function cargarDocumentoFirma(solicitudId) {
    if (documentoFirmaUrl.value) {
      URL.revokeObjectURL(documentoFirmaUrl.value);
      documentoFirmaUrl.value = null;
    }
    cargandoDocumentoFirma.value = true;
    errorDocumentoFirma.value = null;
    try {
      const { data: blob } = await autogestionServicio.obtenerDocumentoFirma(solicitudId);
      documentoFirmaUrl.value = URL.createObjectURL(blob);
    } catch (err) {
      errorDocumentoFirma.value = err.mensaje;
    } finally {
      cargandoDocumentoFirma.value = false;
    }
  }

  async function firmar(solicitudId, consentimiento) {
    firmando.value = true;
    errorFirmar.value = null;
    try {
      await autogestionServicio.firmar(solicitudId, consentimiento);
      firmasPendientes.value = firmasPendientes.value.filter((solicitud) => solicitud._id !== solicitudId);
      return true;
    } catch (err) {
      errorFirmar.value = err.mensaje;
      return false;
    } finally {
      firmando.value = false;
    }
  }

  return {
    empleado,
    contratoVigente,
    cargandoPerfil,
    errorPerfil,
    cargarPerfil,
    documentos,
    cargandoDocumentos,
    errorDocumentos,
    cargarDocumentos,
    turnos,
    cargandoTurnos,
    errorTurnos,
    cargarTurnos,
    politica,
    cargandoPolitica,
    errorPolitica,
    cargarPolitica,
    firmasPendientes,
    cargandoFirmas,
    errorFirmas,
    cargarFirmasPendientes,
    documentoFirmaUrl,
    cargandoDocumentoFirma,
    errorDocumentoFirma,
    cargarDocumentoFirma,
    firmando,
    errorFirmar,
    firmar,
  };
});
