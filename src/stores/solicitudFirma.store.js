import { defineStore } from "pinia";
import { ref } from "vue";
import solicitudFirmaServicio from "@/servicios/solicitudFirma.servicio";

// Sin paginación: se usa embebido en el modal de Contrato de EmpleadosVista.vue, acotado siempre
// a un único empleado/contrato a la vez — nunca es un listado largo que necesite recortarse.
export const useSolicitudFirmaStore = defineStore("solicitudFirma", () => {
  const solicitudes = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  const creando = ref(false);
  const errorCreacion = ref(null);
  const ultimaCreada = ref(null); // { solicitud, enlace, codigoQr } — para mostrar justo después de crear

  const errorAccion = ref(null);

  async function cargarPorEmpleado(empleadoId) {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await solicitudFirmaServicio.listar({ empleadoId });
      solicitudes.value = respuesta.data.solicitudes;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function crear(datos) {
    creando.value = true;
    errorCreacion.value = null;
    ultimaCreada.value = null;
    try {
      const { data: respuesta } = await solicitudFirmaServicio.crear(datos);
      ultimaCreada.value = respuesta.data;
      solicitudes.value.unshift(respuesta.data.solicitud);
      return true;
    } catch (err) {
      errorCreacion.value = err.mensaje;
      return false;
    } finally {
      creando.value = false;
    }
  }

  async function anular(solicitudId) {
    errorAccion.value = null;
    try {
      const { data: respuesta } = await solicitudFirmaServicio.anular(solicitudId);
      const indice = solicitudes.value.findIndex((solicitud) => solicitud._id === solicitudId);
      if (indice !== -1) solicitudes.value[indice] = respuesta.data.solicitud;
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return { solicitudes, cargando, error, creando, errorCreacion, ultimaCreada, errorAccion, cargarPorEmpleado, crear, anular };
});
