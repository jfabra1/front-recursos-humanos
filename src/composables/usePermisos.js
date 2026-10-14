import { useAutenticacionStore } from "@/stores/autenticacion.store";

/**
 * Lee la matriz de permisos REAL del usuario autenticado (`GET /mis-permisos`, cargada
 * en `autenticacion.store.js` al iniciar sesión o restaurarla), no una copia estática:
 * ya refleja tanto la plantilla del rol como cualquier excepción de PermisoPersonalizado
 * que la empresa haya configurado para ese rol.
 *
 * Esto es solo UX (qué mostrar/ocultar). La autorización real siempre ocurre en el
 * backend vía `verificarPermiso` en cada request — aunque alguien manipule el estado
 * del frontend a mano, el backend igual la rechaza con 403 si no corresponde.
 */
export function usePermisos() {
  const autenticacion = useAutenticacionStore();

  function puede(modulo, accion) {
    return autenticacion.permisosEfectivos?.[modulo]?.includes(accion) ?? false;
  }

  return { puede };
}
