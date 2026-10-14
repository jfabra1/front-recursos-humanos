import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/personas/empleados`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  obtener(empleadoId) {
    return clienteHttp.get(`${rutaBase()}/${empleadoId}`);
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(empleadoId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${empleadoId}`, datos);
  },
  darDeBaja(empleadoId) {
    return clienteHttp.patch(`${rutaBase()}/${empleadoId}/baja`);
  },
  recontratar(empleadoId, datos) {
    return clienteHttp.post(`${rutaBase()}/${empleadoId}/recontratar`, datos);
  },
};
