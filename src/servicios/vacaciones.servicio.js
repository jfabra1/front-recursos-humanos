import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/vacaciones`;
}

export default {
  obtenerSaldo(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/saldo/${empleadoId}`);
  },
  listarMovimientos(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/saldo/${empleadoId}/movimientos`);
  },
  causar(empleadoId, fechaCorte) {
    return clienteHttp.post(`${rutaBase()}/saldo/${empleadoId}/causar`, { fechaCorte });
  },
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  aprobar(solicitudId) {
    return clienteHttp.patch(`${rutaBase()}/${solicitudId}/aprobar`);
  },
  rechazar(solicitudId) {
    return clienteHttp.patch(`${rutaBase()}/${solicitudId}/rechazar`);
  },
  cancelar(solicitudId) {
    return clienteHttp.patch(`${rutaBase()}/${solicitudId}/cancelar`);
  },
};
