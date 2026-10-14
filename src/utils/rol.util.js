export const OPCIONES_ROL_BASE = [
  { valor: "administrador_empresa", texto: "Administrador de empresa" },
  { valor: "rrhh", texto: "RRHH" },
  { valor: "jefe_autorizado", texto: "Jefe autorizado" },
  { valor: "responsable_nomina", texto: "Responsable de nómina" },
  { valor: "empleado", texto: "Empleado" },
  { valor: "auditor", texto: "Auditor" },
];

export const ETIQUETAS_ROL_BASE = Object.fromEntries(OPCIONES_ROL_BASE.map((opcion) => [opcion.valor, opcion.texto]));

export const OPCIONES_ACCION = [
  { valor: "leer", texto: "Leer" },
  { valor: "crear", texto: "Crear" },
  { valor: "editar", texto: "Editar" },
  { valor: "eliminar", texto: "Eliminar" },
  { valor: "aprobar", texto: "Aprobar" },
];

export const ETIQUETAS_ACCION = Object.fromEntries(OPCIONES_ACCION.map((opcion) => [opcion.valor, opcion.texto]));

export const OPCIONES_ALCANCE = [
  { valor: "empresa", texto: "Toda la empresa" },
  { valor: "sede", texto: "Solo su sede" },
  { valor: "area", texto: "Solo su área" },
  { valor: "equipo", texto: "Solo su equipo" },
  { valor: "propio", texto: "Solo lo propio" },
];

export const ETIQUETAS_ALCANCE = Object.fromEntries(OPCIONES_ALCANCE.map((opcion) => [opcion.valor, opcion.texto]));

export const OPCIONES_MODULO = [
  { valor: "sede", texto: "Sedes" },
  { valor: "area", texto: "Áreas" },
  { valor: "cargo", texto: "Cargos" },
  { valor: "empleado", texto: "Empleados" },
  { valor: "contrato", texto: "Contratos" },
  { valor: "documento", texto: "Documentos" },
  { valor: "instrumento_colectivo", texto: "Convenciones colectivas" },
  { valor: "usuario", texto: "Usuarios" },
  { valor: "rol", texto: "Roles" },
  { valor: "dispositivo", texto: "Dispositivos" },
  { valor: "horario", texto: "Horarios" },
  { valor: "turno", texto: "Turnos" },
  { valor: "asistencia", texto: "Asistencia" },
  { valor: "incidencia_asistencia", texto: "Incidencias de asistencia" },
  { valor: "hora_extra", texto: "Horas extra" },
  { valor: "cierre_asistencia", texto: "Cierres de asistencia" },
  { valor: "vacacion", texto: "Vacaciones" },
  { valor: "permiso", texto: "Permisos (licencias)" },
  { valor: "incapacidad", texto: "Incapacidades" },
  { valor: "regla_legal", texto: "Reglas legales" },
  { valor: "empresa", texto: "Empresa" },
  { valor: "suscripcion", texto: "Suscripción" },
  { valor: "notificacion", texto: "Notificaciones" },
  { valor: "dashboard", texto: "Dashboard" },
  { valor: "reporte", texto: "Reportes" },
  { valor: "auditoria", texto: "Auditoría" },
];

export const ETIQUETAS_MODULO = Object.fromEntries(OPCIONES_MODULO.map((opcion) => [opcion.valor, opcion.texto]));
