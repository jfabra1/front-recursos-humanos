import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase(sedeSlug) {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/${sedeSlug}/turnos`;
}

export default {
  listar(sedeSlug, filtros = {}) {
    return clienteHttp.get(rutaBase(sedeSlug), { params: filtros });
  },
  resumenPorEmpleado(sedeSlug, params = {}) {
    return clienteHttp.get(`${rutaBase(sedeSlug)}/resumen-por-empleado`, { params });
  },
  crear(sedeSlug, datos) {
    return clienteHttp.post(rutaBase(sedeSlug), datos);
  },
  actualizar(sedeSlug, turnoId, datos) {
    return clienteHttp.patch(`${rutaBase(sedeSlug)}/${turnoId}`, datos);
  },
  anular(sedeSlug, turnoId) {
    return clienteHttp.delete(`${rutaBase(sedeSlug)}/${turnoId}`);
  },
};
