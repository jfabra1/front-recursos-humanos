import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import correccionMarcacionServicio from "@/servicios/correccionMarcacion.servicio";

export const useCorreccionesMarcacionStore = defineStore("correccionesMarcacion", () => {
  const solicitudes = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const errorAccion = ref(null);

  const filtros = reactive({ estado: "pendiente" });

  async function cargarSolicitudes() {
    cargando.value = true;
    error.value = null;
    try {
      const params = {};
      if (filtros.estado) params.estado = filtros.estado;
      const { data: respuesta } = await correccionMarcacionServicio.listar(params);
      solicitudes.value = respuesta.data.solicitudes;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function aprobar(solicitudId) {
    errorAccion.value = null;
    try {
      await correccionMarcacionServicio.aprobar(solicitudId);
      solicitudes.value = solicitudes.value.filter((solicitud) => solicitud._id !== solicitudId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function rechazar(solicitudId) {
    errorAccion.value = null;
    try {
      await correccionMarcacionServicio.rechazar(solicitudId);
      solicitudes.value = solicitudes.value.filter((solicitud) => solicitud._id !== solicitudId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return { solicitudes, cargando, error, errorAccion, filtros, cargarSolicitudes, aprobar, rechazar };
});
