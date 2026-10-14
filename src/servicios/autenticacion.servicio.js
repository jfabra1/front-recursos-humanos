import clienteHttp from "@/servicios/clienteHttp";

/**
 * Llamadas HTTP crudas de autenticación. Nunca se usa directo desde un componente:
 * siempre a través de `stores/autenticacion.store.js`.
 */
export default {
  iniciarSesion({ email, password }) {
    return clienteHttp.post("/v1/auth/login", { email, password });
  },

  refrescarToken() {
    return clienteHttp.post("/v1/auth/refresh");
  },

  cerrarSesion() {
    return clienteHttp.post("/v1/auth/logout");
  },
};
