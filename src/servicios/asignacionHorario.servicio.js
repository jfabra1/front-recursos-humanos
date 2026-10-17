import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase(sedeSlug) {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/${sedeSlug}/asignaciones-horario`;
}

export default {
  listar(sedeSlug, params = {}) {
    return clienteHttp.get(rutaBase(sedeSlug), { params });
  },
  crear(sedeSlug, datos) {
    return clienteHttp.post(rutaBase(sedeSlug), datos);
  },
  anular(sedeSlug, asignacionId) {
    return clienteHttp.delete(`${rutaBase(sedeSlug)}/${asignacionId}`);
  },
  generarTurnos(sedeSlug, asignacionId, datos = {}) {
    return clienteHttp.post(`${rutaBase(sedeSlug)}/${asignacionId}/generar-turnos`, datos);
  },
};
