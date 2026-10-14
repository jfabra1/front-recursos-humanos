import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/notificaciones`;
}

export default {
  listarPropias(filtros = {}) {
    return clienteHttp.get(`${rutaBase()}/mias`, { params: filtros });
  },
  contarNoLeidas() {
    return clienteHttp.get(`${rutaBase()}/mias/no-leidas`);
  },
  marcarLeida(notificacionId) {
    return clienteHttp.patch(`${rutaBase()}/mias/${notificacionId}/leida`);
  },
  listarPorEmpresa(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
};
