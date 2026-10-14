import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}`;
}

export default {
  obtenerPropia() {
    return clienteHttp.get(rutaBase());
  },
  actualizarPropia(datos) {
    return clienteHttp.patch(rutaBase(), datos);
  },
};
