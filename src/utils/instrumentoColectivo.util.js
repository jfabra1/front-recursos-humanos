export const OPCIONES_TIPO_INSTRUMENTO = [
  { valor: "convencion_colectiva", texto: "Convención colectiva" },
  { valor: "pacto_colectivo", texto: "Pacto colectivo" },
  { valor: "laudo_arbitral", texto: "Laudo arbitral" },
];

export const ETIQUETAS_TIPO_INSTRUMENTO = Object.fromEntries(
  OPCIONES_TIPO_INSTRUMENTO.map((opcion) => [opcion.valor, opcion.texto]),
);
