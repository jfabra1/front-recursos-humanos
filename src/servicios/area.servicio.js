import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/organizacion/areas`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(areaId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${areaId}`, datos);
  },
  anular(areaId) {
    return clienteHttp.delete(`${rutaBase()}/${areaId}`);
  },
};
