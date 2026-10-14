export function formatoFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString("es-CO") : "—";
}

export function formatoFechaHora(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export function formatoMoneda(valor) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
}
