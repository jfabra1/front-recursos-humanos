export const OPCIONES_TIPO_PERMISO = [
  { valor: "permiso_general", texto: "Permiso general" },
  { valor: "licencia_maternidad", texto: "Licencia de maternidad" },
  { valor: "licencia_paternidad", texto: "Licencia de paternidad" },
  { valor: "licencia_luto", texto: "Licencia de luto" },
  { valor: "licencia_calamidad", texto: "Licencia por calamidad doméstica" },
];
export const ETIQUETAS_TIPO_PERMISO = Object.fromEntries(OPCIONES_TIPO_PERMISO.map((o) => [o.valor, o.texto]));

export const OPCIONES_ESTADO_PERMISO = [
  { valor: "pendiente", texto: "Pendiente" },
  { valor: "pendiente_segunda_aprobacion", texto: "Pendiente (2da aprobación)" },
  { valor: "aprobada", texto: "Aprobada" },
  { valor: "rechazada", texto: "Rechazada" },
];
export const ETIQUETAS_ESTADO_PERMISO = Object.fromEntries(OPCIONES_ESTADO_PERMISO.map((o) => [o.valor, o.texto]));
