import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/permisos-personalizados`;
}

export default {
  listarPorRol(rolId) {
    return clienteHttp.get(`${rutaBase()}/rol/${rolId}`);
  },
  otorgar(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  eliminar(personalizacionId) {
    return clienteHttp.delete(`${rutaBase()}/${personalizacionId}`);
  },
};
