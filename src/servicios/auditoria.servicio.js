import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/auditoria`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
};
