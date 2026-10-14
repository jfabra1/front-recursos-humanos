export const OPCIONES_TIPO_ORIGEN_INCAPACIDAD = [
  { valor: "EPS", texto: "EPS (enfermedad general)" },
  { valor: "ARL", texto: "ARL (accidente o enfermedad laboral)" },
];
export const ETIQUETAS_TIPO_ORIGEN_INCAPACIDAD = Object.fromEntries(OPCIONES_TIPO_ORIGEN_INCAPACIDAD.map((o) => [o.valor, o.texto]));

export const OPCIONES_ESTADO_INCAPACIDAD = [
  { valor: "registrado", texto: "Registrada" },
  { valor: "radicado", texto: "Radicada" },
  { valor: "reconocido", texto: "Reconocida" },
  { valor: "pagado", texto: "Pagada" },
  { valor: "enDisputa", texto: "En disputa" },
];
export const ETIQUETAS_ESTADO_INCAPACIDAD = Object.fromEntries(OPCIONES_ESTADO_INCAPACIDAD.map((o) => [o.valor, o.texto]));
