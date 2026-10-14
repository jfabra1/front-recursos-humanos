import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/documentos`;
}

export default {
  listarPorEmpleado(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/empleado/${empleadoId}`);
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  anular(documentoId) {
    return clienteHttp.delete(`${rutaBase()}/${documentoId}`);
  },
};
