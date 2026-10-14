export const OPCIONES_ESTADO_VACACIONES = [
  { valor: "pendiente", texto: "Pendiente" },
  { valor: "pendiente_segunda_aprobacion", texto: "Pendiente (2da aprobación)" },
  { valor: "aprobada", texto: "Aprobada" },
  { valor: "rechazada", texto: "Rechazada" },
  { valor: "cancelada", texto: "Cancelada" },
];
export const ETIQUETAS_ESTADO_VACACIONES = Object.fromEntries(OPCIONES_ESTADO_VACACIONES.map((o) => [o.valor, o.texto]));

export const ETIQUETAS_TIPO_MOVIMIENTO_VACACIONES = {
  causacion: "Causación",
  disfrute: "Disfrute",
  compensacion: "Compensación",
  ajuste: "Ajuste",
};
