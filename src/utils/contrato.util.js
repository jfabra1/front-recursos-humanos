export const OPCIONES_TIPO_VINCULO = [
  { valor: "termino_fijo", texto: "Término fijo" },
  { valor: "indefinido", texto: "Indefinido" },
  { valor: "obra_labor", texto: "Obra o labor" },
  { valor: "aprendizaje", texto: "Aprendizaje" },
];

export const ETIQUETAS_TIPO_VINCULO = Object.fromEntries(OPCIONES_TIPO_VINCULO.map((opcion) => [opcion.valor, opcion.texto]));
