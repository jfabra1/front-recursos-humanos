import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase(sedeSlug) {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/${sedeSlug}/cierres`;
}

export default {
  listar(sedeSlug, filtros = {}) {
    return clienteHttp.get(rutaBase(sedeSlug), { params: filtros });
  },
  crear(sedeSlug, datos) {
    return clienteHttp.post(rutaBase(sedeSlug), datos);
  },
  calcularTotales(sedeSlug, cierreId) {
    return clienteHttp.post(`${rutaBase(sedeSlug)}/${cierreId}/calcular-totales`);
  },
  avanzarEstado(sedeSlug, cierreId, estado) {
    return clienteHttp.patch(`${rutaBase(sedeSlug)}/${cierreId}/avanzar-estado`, { estado });
  },
};
