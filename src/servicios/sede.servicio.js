import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/organizacion/sedes`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(sedeId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${sedeId}`, datos);
  },
  anular(sedeId) {
    return clienteHttp.delete(`${rutaBase()}/${sedeId}`);
  },
};
