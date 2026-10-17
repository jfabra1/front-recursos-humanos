import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/solicitudes-firma`;
}

export default {
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  listar(params = {}) {
    return clienteHttp.get(rutaBase(), { params });
  },
  obtener(id) {
    return clienteHttp.get(`${rutaBase()}/${id}`);
  },
  anular(id) {
    return clienteHttp.post(`${rutaBase()}/${id}/anular`);
  },
};
