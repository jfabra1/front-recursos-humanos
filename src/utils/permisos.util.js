// Enums espejo de `backend/src/utils/permisos.util.js` — mismos valores, usados para
// construir selects y para pedir `puede(modulo, accion)` en `composables/usePermisos.js`.
// La matriz de permisos en sí (qué puede cada rol) YA NO vive aquí de forma estática:
// se resuelve en el backend (`GET /mis-permisos`, ver `PermisosEfectivosService`) y se
// guarda en `stores/autenticacion.store.js` — así se reflejan también las excepciones
// de `PermisoPersonalizado` que cada empresa configure, no solo las 6 plantillas base.

export const ROLES = Object.freeze({
  ADMINISTRADOR_EMPRESA: "administrador_empresa",
  RRHH: "rrhh",
  JEFE_AUTORIZADO: "jefe_autorizado",
  RESPONSABLE_NOMINA: "responsable_nomina",
  EMPLEADO: "empleado",
  AUDITOR: "auditor",
});

export const ACCIONES = Object.freeze({
  LEER: "leer",
  CREAR: "crear",
  EDITAR: "editar",
  ELIMINAR: "eliminar",
  APROBAR: "aprobar",
});

export const MODULOS = Object.freeze({
  SEDE: "sede",
  AREA: "area",
  CARGO: "cargo",
  EMPLEADO: "empleado",
  CONTRATO: "contrato",
  DOCUMENTO: "documento",
  INSTRUMENTO_COLECTIVO: "instrumento_colectivo",
  USUARIO: "usuario",
  ROL: "rol",
  DISPOSITIVO: "dispositivo",
  HORARIO: "horario",
  TURNO: "turno",
  ASISTENCIA: "asistencia",
  INCIDENCIA_ASISTENCIA: "incidencia_asistencia",
  HORA_EXTRA: "hora_extra",
  CIERRE_ASISTENCIA: "cierre_asistencia",
  VACACION: "vacacion",
  PERMISO: "permiso",
  INCAPACIDAD: "incapacidad",
  REGLA_LEGAL: "regla_legal",
  EMPRESA: "empresa",
  SUSCRIPCION: "suscripcion",
  NOTIFICACION: "notificacion",
  DASHBOARD: "dashboard",
  REPORTE: "reporte",
  AUDITORIA: "auditoria",
});
