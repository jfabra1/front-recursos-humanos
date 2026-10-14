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
  historialPorEmpleado(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/empleado/${empleadoId}/historial`);
  },
  porVencer(dias) {
    return clienteHttp.get(`${rutaBase()}/por-vencer`, { params: dias ? { dias } : {} });
  },
};
