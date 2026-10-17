import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/carta-renuncia`;
}

export default {
  // --- Autoservicio (empleado) ---
  crearBorrador(datos) {
    return clienteHttp.post(rutaBase(), datos);
  },
  obtenerPropia() {
    return clienteHttp.get(`${rutaBase()}/mia`);
  },
  actualizarBorrador(cartaId, datos) {
    return clienteHttp.patch(`${rutaBase()}/${cartaId}`, datos);
  },
  retirarBorrador(cartaId) {
    return clienteHttp.delete(`${rutaBase()}/${cartaId}`);
  },
  enviarAFirma(cartaId) {
    return clienteHttp.post(`${rutaBase()}/${cartaId}/enviar-a-firma`);
  },

  // --- Administración (RR. HH./admin) ---
  listar(params = {}) {
    return clienteHttp.get(rutaBase(), { params });
  },
  obtener(cartaId) {
    return clienteHttp.get(`${rutaBase()}/${cartaId}`);
  },
  anular(cartaId) {
    return clienteHttp.post(`${rutaBase()}/${cartaId}/anular`);
  },
};
