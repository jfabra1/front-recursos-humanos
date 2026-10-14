import clienteHttpOperador from "@/servicios/clienteHttpOperador";

export default {
  crear(datosEmpresa) {
    return clienteHttpOperador.post("/super/v1/empresas", datosEmpresa);
  },

  suspender(empresaId, motivo) {
    return clienteHttpOperador.patch(`/super/v1/empresas/${empresaId}/suspender`, { motivo });
  },

  reactivar(empresaId) {
    return clienteHttpOperador.patch(`/super/v1/empresas/${empresaId}/reactivar`);
  },
};
