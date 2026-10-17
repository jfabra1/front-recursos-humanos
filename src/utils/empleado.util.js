export const OPCIONES_TIPO_DOCUMENTO = [
  { valor: "CC", texto: "Cédula de ciudadanía" },
  { valor: "CE", texto: "Cédula de extranjería" },
  { valor: "PASAPORTE", texto: "Pasaporte" },
  { valor: "PPT", texto: "Permiso de Protección Temporal" },
];
export const ETIQUETAS_TIPO_DOCUMENTO = Object.fromEntries(OPCIONES_TIPO_DOCUMENTO.map((o) => [o.valor, o.texto]));

export const OPCIONES_MODALIDAD = [
  { valor: "PRESENCIAL", texto: "Presencial" },
  { valor: "CAMPO", texto: "Campo" },
  { valor: "TELETRABAJO", texto: "Teletrabajo" },
  { valor: "REMOTO", texto: "Remoto" },
  { valor: "MIXTO", texto: "Mixto" },
];
export const ETIQUETAS_MODALIDAD = Object.fromEntries(OPCIONES_MODALIDAD.map((o) => [o.valor, o.texto]));

export const ETIQUETAS_ESTADO = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente_retiro: "Pendiente de retiro",
};
