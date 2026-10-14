import axios from "axios";
import { useOperadorStore } from "@/stores/operador.store";

/**
 * Cliente HTTP exclusivo para el panel de operador (`/api/super/v1/...`).
 * Instancia separada de `clienteHttp.js` a propósito: el backend usa un JWT
 * completamente distinto para operadores (ver `OPERADOR_JWT_SECRET` en el backend) y
 * nunca debe mezclarse con el access token de un usuario de empresa.
 */
const clienteHttpOperador = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

clienteHttpOperador.interceptors.request.use((config) => {
  const operador = useOperadorStore();
  if (operador.token) {
    config.headers.Authorization = `Bearer ${operador.token}`;
  }
  return config;
});

clienteHttpOperador.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const mensaje = error.response?.data?.message || "No se pudo conectar con el servidor";
    const statusCode = error.response?.status ?? 0;
    return Promise.reject({ mensaje, statusCode, original: error });
  },
);

export default clienteHttpOperador;
