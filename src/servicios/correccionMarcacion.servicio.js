import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/correcciones-marcacion`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  aprobar(solicitudId) {
    return clienteHttp.patch(`${rutaBase()}/${solicitudId}/aprobar`);
  },
  rechazar(solicitudId) {
    return clienteHttp.patch(`${rutaBase()}/${solicitudId}/rechazar`);
  },
};
