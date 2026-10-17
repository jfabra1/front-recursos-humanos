import clienteHttpOperador from "@/servicios/clienteHttpOperador";

export default {
  listar(filtros = {}) {
    return clienteHttpOperador.get("/super/v1/reglas-legales", { params: filtros });
  },

  crearVersion(datos) {
    return clienteHttpOperador.post("/super/v1/reglas-legales", datos);
  },
};
