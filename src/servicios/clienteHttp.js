import axios from "axios";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

/**
 * Instancia única de axios. Ningún componente la importa directamente:
 * solo los servicios (`src/servicios/`), que a su vez solo son llamados desde los stores.
 */
const clienteHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envía/recibe la cookie httpOnly del refresh token
});

clienteHttp.interceptors.request.use((config) => {
  const autenticacion = useAutenticacionStore();
  if (autenticacion.accessToken) {
    config.headers.Authorization = `Bearer ${autenticacion.accessToken}`;
  }
  return config;
});

// El backend ya devuelve el error formado (`{ statusCode, status, message }`, ver
// `backend/src/utils/ErrorApi.js` + `server.js#setErrorHandler`). Aquí solo se normaliza
// para que los stores lean siempre `error.mensaje` y `error.statusCode`, sin volver a
// interpretar la respuesta HTTP cruda.
clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    let mensaje = error.response?.data?.message || "No se pudo conectar con el servidor";
    const statusCode = error.response?.status ?? 0;

    // Con `responseType: "blob"` (descarga de reportes), un error también llega como Blob en
    // vez de JSON — sin esto, cualquier 404/400 de una descarga mostraría el mensaje genérico.
    if (error.response?.data instanceof Blob && error.response.data.type?.includes("json")) {
      try {
        mensaje = JSON.parse(await error.response.data.text())?.message || mensaje;
      } catch {
        // Si el blob de error no se puede leer/parsear, se mantiene el mensaje genérico.
      }
    }

    return Promise.reject({ mensaje, statusCode, original: error });
  },
);

export default clienteHttp;
