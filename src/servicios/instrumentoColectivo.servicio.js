import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/instrumentos-colectivos`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  anular(instrumentoId) {
    return clienteHttp.delete(`${rutaBase()}/${instrumentoId}`);
  },
};
