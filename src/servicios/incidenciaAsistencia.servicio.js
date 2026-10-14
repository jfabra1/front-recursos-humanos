import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase(sedeSlug) {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/${sedeSlug}/incidencias`;
}

export default {
  listar(sedeSlug, filtros = {}) {
    return clienteHttp.get(rutaBase(sedeSlug), { params: filtros });
  },
  marcarEnRevision(sedeSlug, incidenciaId) {
    return clienteHttp.patch(`${rutaBase(sedeSlug)}/${incidenciaId}/en-revision`);
  },
  resolver(sedeSlug, incidenciaId) {
    return clienteHttp.patch(`${rutaBase(sedeSlug)}/${incidenciaId}/resolver`);
  },
};
