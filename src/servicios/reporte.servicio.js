import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/reportes`;
}

export default {
  generar(datos) {
    return clienteHttp.post(`${rutaBase()}/exportaciones`, datos);
  },
  listar(filtros = {}) {
    return clienteHttp.get(`${rutaBase()}/exportaciones`, { params: filtros });
  },
  descargar(exportacionId) {
    return clienteHttp.get(`${rutaBase()}/exportaciones/${exportacionId}/descargar`, { responseType: "blob" });
  },
};
