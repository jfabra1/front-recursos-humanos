import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/roles`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(rolId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${rolId}`, datos);
  },
  anular(rolId) {
    return clienteHttp.delete(`${rutaBase()}/${rolId}`);
  },
};
