import clienteHttpOperador from "@/servicios/clienteHttpOperador";

export default {
  listar(filtros = {}) {
    return clienteHttpOperador.get("/super/v1/planes", { params: filtros });
  },

  crear(datosPlan) {
    return clienteHttpOperador.post("/super/v1/planes", datosPlan);
  },
};
