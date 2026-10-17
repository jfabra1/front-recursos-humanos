export const OPCIONES_ESTADO_VALIDACION = [
  { valor: "BASE_NORMATIVA_IDENTIFICADA", texto: "Base normativa identificada" },
  { valor: "CONFIRMADA_POR_ABOGADO", texto: "Confirmada por abogado" },
  { valor: "REQUIERE_VERIFICACION", texto: "Requiere verificación" },
];
export const ETIQUETAS_ESTADO_VALIDACION = Object.fromEntries(OPCIONES_ESTADO_VALIDACION.map((o) => [o.valor, o.texto]));

// `valor` es Mixed en el backend (número, texto o un objeto como {inicio, fin} para franjas
// horarias) — se escribe como texto libre y se intenta interpretar como JSON antes de mandarlo,
// cayendo a texto plano si no parsea (ej. una unidad no numérica).
export function parsearValorReglaLegal(texto) {
  const limpio = texto.trim();
  if (!limpio) return undefined;
  try {
    return JSON.parse(limpio);
  } catch {
    return limpio;
  }
}

export function formatoValorReglaLegal(valor) {
  return typeof valor === "object" ? JSON.stringify(valor) : String(valor);
}
