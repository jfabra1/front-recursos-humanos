import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/organizacion/cargos`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(cargoId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${cargoId}`, datos);
  },
  anular(cargoId) {
    return clienteHttp.delete(`${rutaBase()}/${cargoId}`);
  },
};
