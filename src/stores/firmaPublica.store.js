import { defineStore } from "pinia";
import { ref } from "vue";
import firmaPublicaServicio from "@/servicios/firmaPublica.servicio";

export const useFirmaPublicaStore = defineStore("firmaPublica", () => {
  const meta = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const enviandoOtp = ref(false);
  const verificandoOtp = ref(false);
  const errorOtp = ref(null);
  const correoEnviadoA = ref(null);

  const documentoUrl = ref(null);
  const cargandoDocumento = ref(false);

  const firmando = ref(false);
  const errorFirmar = ref(null);
  const firmado = ref(false);

  async function cargarMeta(empresaSlug, token) {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await firmaPublicaServicio.obtenerMeta(empresaSlug, token);
      meta.value = respuesta.data;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function solicitarOtp(empresaSlug, token) {
    enviandoOtp.value = true;
    errorOtp.value = null;
    try {
      const { data: respuesta } = await firmaPublicaServicio.solicitarOtp(empresaSlug, token);
      correoEnviadoA.value = respuesta.data.correoParcial;
      return true;
    } catch (err) {
      errorOtp.value = err.mensaje;
      return false;
    } finally {
      enviandoOtp.value = false;
    }
  }

  async function verificarOtp(empresaSlug, token, codigo) {
    verificandoOtp.value = true;
    errorOtp.value = null;
    try {
      await firmaPublicaServicio.verificarOtp(empresaSlug, token, codigo);
      meta.value.otpVerificado = true;
      return true;
    } catch (err) {
      errorOtp.value = err.mensaje;
      return false;
    } finally {
      verificandoOtp.value = false;
    }
  }

  async function cargarDocumento(empresaSlug, token) {
    if (documentoUrl.value) {
      URL.revokeObjectURL(documentoUrl.value);
      documentoUrl.value = null;
    }
    cargandoDocumento.value = true;
    try {
      const { data: blob } = await firmaPublicaServicio.obtenerDocumento(empresaSlug, token);
      documentoUrl.value = URL.createObjectURL(blob);
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargandoDocumento.value = false;
    }
  }

  async function firmar(empresaSlug, token, consentimiento) {
    firmando.value = true;
    errorFirmar.value = null;
    try {
      await firmaPublicaServicio.firmar(empresaSlug, token, consentimiento);
      firmado.value = true;
      return true;
    } catch (err) {
      errorFirmar.value = err.mensaje;
      return false;
    } finally {
      firmando.value = false;
    }
  }

  return {
    meta,
    cargando,
    error,
    enviandoOtp,
    verificandoOtp,
    errorOtp,
    correoEnviadoA,
    documentoUrl,
    cargandoDocumento,
    firmando,
    errorFirmar,
    firmado,
    cargarMeta,
    solicitarOtp,
    verificarOtp,
    cargarDocumento,
    firmar,
  };
});
