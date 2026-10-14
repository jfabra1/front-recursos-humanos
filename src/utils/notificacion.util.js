export const OPCIONES_ESTADO_NOTIFICACION = [
  { valor: "pendiente", texto: "Pendiente" },
  { valor: "enviada", texto: "Enviada" },
  { valor: "leida", texto: "Leída" },
  { valor: "fallida", texto: "Fallida" },
];
export const ETIQUETAS_ESTADO_NOTIFICACION = Object.fromEntries(OPCIONES_ESTADO_NOTIFICACION.map((o) => [o.valor, o.texto]));

export const OPCIONES_CANAL_NOTIFICACION = [
  { valor: "web", texto: "Web (buzón interno)" },
  { valor: "push", texto: "Push (app móvil)" },
];
export const ETIQUETAS_CANAL_NOTIFICACION = Object.fromEntries(OPCIONES_CANAL_NOTIFICACION.map((o) => [o.valor, o.texto]));
