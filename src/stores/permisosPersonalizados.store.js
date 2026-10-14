import { defineStore } from "pinia";
import { ref } from "vue";
import permisoPersonalizadoServicio from "@/servicios/permisoPersonalizado.servicio";

export const usePermisosPersonalizadosStore = defineStore("permisosPersonalizados", () => {
  const excepciones = ref([]);
  const rolIdActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const errorAccion = ref(null);

  async function cargarExcepciones(rolId) {
    rolIdActual.value = rolId;
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await permisoPersonalizadoServicio.listarPorRol(rolId);
      excepciones.value = respuesta.data.personalizaciones;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function otorgarExcepcion(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await permisoPersonalizadoServicio.otorgar(datos);
      const indice = excepciones.value.findIndex(
        (excepcion) => excepcion.modulo === datos.modulo && excepcion.accion === datos.accion,
      );
      if (indice !== -1) excepciones.value[indice] = respuesta.data.personalizacion;
      else excepciones.value.unshift(respuesta.data.personalizacion);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function eliminarExcepcion(personalizacionId) {
    errorAccion.value = null;
    try {
      await permisoPersonalizadoServicio.eliminar(personalizacionId);
      excepciones.value = excepciones.value.filter((excepcion) => excepcion._id !== personalizacionId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    excepciones,
    rolIdActual,
    cargando,
    error,
    guardando,
    errorGuardado,
    errorAccion,
    cargarExcepciones,
    otorgarExcepcion,
    eliminarExcepcion,
  };
});
