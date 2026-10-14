export const OPCIONES_TIPO_REPORTE = [
  { valor: "asistencias", texto: "Asistencias" },
  { valor: "incidencias", texto: "Incidencias de asistencia" },
  { valor: "horas_extra", texto: "Horas extra" },
  { valor: "incapacidades", texto: "Incapacidades" },
  { valor: "saldos_vacaciones", texto: "Saldos de vacaciones" },
  { valor: "cumplimiento_marcacion", texto: "Cumplimiento de marcación" },
];
export const ETIQUETAS_TIPO_REPORTE = Object.fromEntries(OPCIONES_TIPO_REPORTE.map((o) => [o.valor, o.texto]));

// Por ahora el backend solo genera 'csv' de verdad — 'xlsx'/'pdf' existen en el esquema pero
// responden 400 ("pendiente de implementar"), así que no se ofrecen como opción todavía.
export const OPCIONES_FORMATO_REPORTE = [{ valor: "csv", texto: "CSV" }];

// 'saldos_vacaciones' es una foto del momento (el saldo vigente de cada empleado), no un
// histórico de eventos — es el único tipo que no exige 'desde'/'hasta'.
export const TIPOS_SIN_RANGO_OBLIGATORIO = ["saldos_vacaciones"];

// Los demás tipos no filtran por sede en el backend (horas_extra/incapacidades/saldos son
// por empleado, no por sede).
export const TIPOS_CON_FILTRO_SEDE = ["asistencias", "incidencias", "cumplimiento_marcacion"];
