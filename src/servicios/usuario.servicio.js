import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/usuarios`;
}

export default {
  listar(filtros = {}) {
    return clienteHttp.get(rutaBase(), { params: filtros });
  },
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  actualizar(usuarioObjetivoId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${usuarioObjetivoId}`, datos);
  },
  restablecerPassword(usuarioObjetivoId, nuevaPassword) {
    return clienteHttp.patch(`${rutaBase()}/${usuarioObjetivoId}/restablecer-password`, { nuevaPassword });
  },
};
