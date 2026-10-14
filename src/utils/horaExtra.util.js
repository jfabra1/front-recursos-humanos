export const OPCIONES_ESTADO_AUTORIZACION = [
  { valor: "pendiente", texto: "Pendiente" },
  { valor: "pendiente_segunda_aprobacion", texto: "Pendiente (2da aprobación)" },
  { valor: "aprobada", texto: "Aprobada" },
  { valor: "rechazada", texto: "Rechazada" },
  { valor: "no_solicitada", texto: "No solicitada (detectada)" },
];
export const ETIQUETAS_ESTADO_AUTORIZACION = Object.fromEntries(OPCIONES_ESTADO_AUTORIZACION.map((o) => [o.valor, o.texto]));

export const ETIQUETAS_ESTADO_ACREDITACION = {
  no_acreditada: "No acreditada",
  acreditada_parcial: "Acreditada parcial",
  acreditada: "Acreditada",
};
