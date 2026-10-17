import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/autogestion`;
}

export default {
  obtenerPerfil() {
    return clienteHttp.get(`${rutaBase()}/perfil`);
  },
  listarDocumentos() {
    return clienteHttp.get(`${rutaBase()}/documentos`);
  },
  listarTurnos(filtros = {}) {
    return clienteHttp.get(`${rutaBase()}/turnos`, { params: filtros });
  },
  obtenerPrivacidad() {
    return clienteHttp.get(`${rutaBase()}/privacidad`);
  },
  listarFirmasPendientes() {
    return clienteHttp.get(`${rutaBase()}/firmas-pendientes`);
  },
  obtenerDocumentoFirma(solicitudId) {
    return clienteHttp.get(`${rutaBase()}/firmas-pendientes/${solicitudId}/documento`, { responseType: "blob" });
  },
  firmar(solicitudId, consentimiento) {
    return clienteHttp.post(`${rutaBase()}/firmas-pendientes/${solicitudId}/firmar`, { consentimiento });
  },
};
