import { defineStore } from "pinia";
import { ref } from "vue";
import dispositivoServicio from "@/servicios/dispositivo.servicio";

export const useDispositivosStore = defineStore("dispositivos", () => {
  const pendientes = ref([]);
  const cargandoPendientes = ref(false);
  const errorPendientes = ref(null);

  const porEmpleado = ref([]);
  const cargandoPorEmpleado = ref(false);
  const errorPorEmpleado = ref(null);

  const errorAccion = ref(null);

  async function cargarPendientes() {
    cargandoPendientes.value = true;
    errorPendientes.value = null;
    try {
      const { data: respuesta } = await dispositivoServicio.listarPendientes();
      pendientes.value = respuesta.data.dispositivos;
    } catch (err) {
      errorPendientes.value = err.mensaje;
    } finally {
      cargandoPendientes.value = false;
    }
  }

  async function cargarPorEmpleado(empleadoId) {
    cargandoPorEmpleado.value = true;
    errorPorEmpleado.value = null;
    try {
      const { data: respuesta } = await dispositivoServicio.listarPorEmpleado(empleadoId);
      porEmpleado.value = respuesta.data.dispositivos;
    } catch (err) {
      errorPorEmpleado.value = err.mensaje;
    } finally {
      cargandoPorEmpleado.value = false;
    }
  }

  async function aprobarCambio(dispositivoId) {
    errorAccion.value = null;
    try {
      await dispositivoServicio.aprobarCambio(dispositivoId);
      pendientes.value = pendientes.value.filter((dispositivo) => dispositivo._id !== dispositivoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  async function revocar(dispositivoId) {
    errorAccion.value = null;
    try {
      await dispositivoServicio.revocar(dispositivoId);
      const indice = porEmpleado.value.findIndex((dispositivo) => dispositivo._id === dispositivoId);
      if (indice !== -1) porEmpleado.value[indice].estado = "revocado";
      pendientes.value = pendientes.value.filter((dispositivo) => dispositivo._id !== dispositivoId);
      return true;
    } catch (err) {
      errorAccion.value = err.mensaje;
      return false;
    }
  }

  return {
    pendientes,
    cargandoPendientes,
    errorPendientes,
    porEmpleado,
    cargandoPorEmpleado,
    errorPorEmpleado,
    errorAccion,
    cargarPendientes,
    cargarPorEmpleado,
    aprobarCambio,
    revocar,
  };
});
