import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/horarios`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(horarioId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${horarioId}`, datos);
  },
  anular(horarioId) {
    return clienteHttp.delete(`${rutaBase()}/${horarioId}`);
  },
};
