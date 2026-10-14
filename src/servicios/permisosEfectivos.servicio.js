import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

export default {
  obtenerMios() {
    const autenticacion = useAutenticacionStore();
    return clienteHttp.get(`/v1/${autenticacion.empresaSlug}/mis-permisos`);
  },
};
