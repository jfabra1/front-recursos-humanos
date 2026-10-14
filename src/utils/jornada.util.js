// Enums de todo lo relacionado a Jornada y asistencia (Horario, Turno, Marcación,
// Dispositivo, Incidencia, Corrección, Cierre). Agrupados en un solo archivo porque son
// un mismo dominio y la mayoría de vistas de este módulo necesitan varios a la vez.

export const OPCIONES_TIPO_HORARIO = [
  { valor: "fijo", texto: "Fijo" },
  { valor: "rotativo", texto: "Rotativo" },
  { valor: "flexible", texto: "Flexible" },
  { valor: "nocturno", texto: "Nocturno" },
  { valor: "partido", texto: "Partido" },
];
export const ETIQUETAS_TIPO_HORARIO = Object.fromEntries(OPCIONES_TIPO_HORARIO.map((o) => [o.valor, o.texto]));

export const ETIQUETAS_ESTADO_DISPOSITIVO = {
  registrado: "Registrado",
  revocado: "Revocado",
  pendiente_reemplazo: "Pendiente de reemplazo",
};

export const ETIQUETAS_TIPO_MARCACION = {
  entrada: "Entrada",
  salida: "Salida",
  inicio_descanso: "Inicio de descanso",
  fin_descanso: "Fin de descanso",
};

export const ETIQUETAS_TIPO_INCIDENCIA = {
  tardanza: "Tardanza",
  omision: "Omisión de marcación",
  salida_temprana: "Salida temprana",
  posible_hora_extra: "Posible hora extra",
  ausencia: "Ausencia",
  bloqueo: "Bloqueo (geocerca/biometría)",
  pendiente_de_soporte: "Pendiente de soporte",
};

export const OPCIONES_ESTADO_INCIDENCIA = [
  { valor: "abierta", texto: "Abierta" },
  { valor: "en_revision", texto: "En revisión" },
  { valor: "resuelta", texto: "Resuelta" },
];
export const ETIQUETAS_ESTADO_INCIDENCIA = Object.fromEntries(OPCIONES_ESTADO_INCIDENCIA.map((o) => [o.valor, o.texto]));

export const ETIQUETAS_ESTADO_SOLICITUD_CORRECCION = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

// Orden real de la máquina de estados del cierre — un paso a la vez, nunca saltar.
export const ESTADOS_CIERRE = ["abierto", "en_revision", "validado", "cerrado", "procesado"];
export const ETIQUETAS_ESTADO_CIERRE = {
  abierto: "Abierto",
  en_revision: "En revisión",
  validado: "Validado",
  cerrado: "Cerrado",
  procesado: "Procesado",
};

export function siguienteEstadoCierre(estadoActual) {
  const indice = ESTADOS_CIERRE.indexOf(estadoActual);
  return indice >= 0 && indice < ESTADOS_CIERRE.length - 1 ? ESTADOS_CIERRE[indice + 1] : null;
}
