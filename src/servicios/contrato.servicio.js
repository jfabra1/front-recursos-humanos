import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/contratos`;
}

export default {
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  renovar(contratoId, datos) {
    return clienteHttp.post(`${rutaBase()}/${contratoId}/renovar`, datos);
  },
  alertaOtrosi(contratoId) {
    return clienteHttp.get(`${rutaBase()}/${contratoId}/alerta-otrosi`);
  },
  confirmarOtrosi(contratoId) {
    return clienteHttp.post(`${rutaBase()}/${contratoId}/confirmar-otrosi`);
  },
  descartarOtrosi(contratoId) {
    return clienteHttp.delete(`${rutaBase()}/${contratoId}/otrosi`);
  },
  historialPorEmpleado(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/empleado/${empleadoId}/historial`);
  },
  porVencer(dias) {
    return clienteHttp.get(`${rutaBase()}/por-vencer`, { params: dias ? { dias } : {} });
  },
};
