import clienteHttp from "@/servicios/clienteHttp";
import { useAutenticacionStore } from "@/stores/autenticacion.store";

function rutaBase(sedeSlug) {
  const autenticacion = useAutenticacionStore();
  return `/v1/${autenticacion.empresaSlug}/${sedeSlug}/asistencia`;
}

export default {
  // Solo lectura desde este panel: marcar es self-service del empleado (ACCIONES.CREAR
  // de ASISTENCIA solo lo tiene el rol `empleado`, ver utils/permisos.util.js).
  listar(sedeSlug, filtros = {}) {
    return clienteHttp.get(rutaBase(sedeSlug), { params: filtros });
  },
};
