import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase() {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/archivos`;
}

export default {
  // El endpoint es genérico (lo usan Documento, Marcación, el logo de Empresa, etc.) — axios
  // detecta el FormData solo y pone el Content-Type con boundary correcto, no hay que tocarlo.
  subir(archivo) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return clienteHttp.post(rutaBase(), formData);
  },
  // Detrás de autenticación (no es una URL pública) — para mostrar un preview hay que pedirlo
  // como blob, igual que los PDF de reportes/documentos (ver reportes.store.js).
  descargar(archivoId) {
    return clienteHttp.get(`${rutaBase()}/${archivoId}`, { responseType: "blob" });
  },
};
