import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/plantillas-contrato`;
}

export default {
  crear(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  listar(params = {}) {
    return clienteHttp.get(rutaBase(), { params });
  },
  obtener(id) {
    return clienteHttp.get(`${rutaBase()}/${id}`);
  },
  actualizar(id, datos) {
    return clienteHttp.patch(`${rutaBase()}/${id}`, datos);
  },
  anular(id) {
    return clienteHttp.delete(`${rutaBase()}/${id}`);
  },
  variables() {
    return clienteHttp.get(`${rutaBase()}/variables`);
  },
  crearEjemplos() {
    return clienteHttp.post(`${rutaBase()}/ejemplos`);
  },
  generarPdf(id, contratoId) {
    return clienteHttp.get(`${rutaBase()}/${id}/pdf`, { params: contratoId ? { contratoId } : {}, responseType: "blob" });
  },
};
