import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/dispositivos`;
}

export default {
  listarPendientes() {
    return clienteHttp.get(`${rutaBase()}/pendientes`);
  },
  listarPorEmpleado(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/empleado/${empleadoId}`);
  },
  aprobarCambio(dispositivoId) {
    return clienteHttp.patch(`${rutaBase()}/${dispositivoId}/aprobar-cambio`);
  },
  revocar(dispositivoId) {
    return clienteHttp.patch(`${rutaBase()}/${dispositivoId}/revocar`);
  },
};
