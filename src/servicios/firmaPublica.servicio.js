import clienteHttp from "@/servicios/clienteHttp";

// Sin useAutenticacionStore para la ruta base: a diferencia de los demás servicios, el slug de
// empresa viene de los parámetros de la URL pública (/firmar/:empresaSlug/:token), no de una
// sesión — quien abre esta página puede no tener cuenta en la plataforma.
function rutaBase(empresaSlug, token) {
  return `/v1/${empresaSlug}/firmas/${token}`;
}

export default {
  obtenerMeta(empresaSlug, token) {
    return clienteHttp.get(rutaBase(empresaSlug, token));
  },
  solicitarOtp(empresaSlug, token) {
    return clienteHttp.post(`${rutaBase(empresaSlug, token)}/otp`);
  },
  verificarOtp(empresaSlug, token, codigo) {
    return clienteHttp.post(`${rutaBase(empresaSlug, token)}/otp/verificar`, { codigo });
  },
  obtenerDocumento(empresaSlug, token) {
    return clienteHttp.get(`${rutaBase(empresaSlug, token)}/documento`, { responseType: "blob" });
  },
  firmar(empresaSlug, token, consentimiento) {
    return clienteHttp.post(`${rutaBase(empresaSlug, token)}/firmar`, { consentimiento });
  },
};
