import clienteHttpOperador from "@/servicios/clienteHttpOperador";

export default {
  iniciarSesion({ email, password }) {
    return clienteHttpOperador.post("/super/v1/auth/login", { email, password });
  },
};
