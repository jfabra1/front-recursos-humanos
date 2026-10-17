export const ETIQUETAS_ESTADO_SOLICITUD_FIRMA = {
  pendiente: "Pendiente de firma",
  firmado: "Firmado",
  expirado: "Expirado",
  anulado: "Anulado",
};

// Mismo orden del sub-array append-only `eventos` en el backend (ver SolicitudFirma.js) — es el
// rastro de auditoría de la firma, nunca se edita ni se borra un evento ya escrito.
export const ETIQUETAS_EVENTO_FIRMA = {
  creada: "Solicitud creada",
  enlace_visto: "Enlace abierto",
  otp_solicitado: "Código de verificación solicitado",
  otp_verificado: "Código de verificación confirmado",
  documento_visto: "Documento abierto",
  firmada: "Documento firmado",
  anulada: "Solicitud anulada",
  expirada: "Solicitud expirada",
};

export const ETIQUETAS_MEDIO_AUTENTICACION = {
  sesion_app: "Sesión autenticada en la plataforma",
  otp_correo: "Enlace público verificado por código al correo",
};
