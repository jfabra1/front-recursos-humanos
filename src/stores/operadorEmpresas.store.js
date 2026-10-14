import { defineStore } from "pinia";
import { ref } from "vue";
import operadorEmpresaServicio from "@/servicios/operadorEmpresa.servicio";

// El backend de operador aún no expone un listado de empresas (solo crear/suspender/
// reactivar por id), así que este store no mantiene una colección: solo el resultado
// de la última acción, para retroalimentar el formulario correspondiente.
export const useOperadorEmpresasStore = defineStore("operadorEmpresas", () => {
  const creando = ref(false);
  const errorCreacion = ref(null);
  const empresaCreada = ref(null);

  const actualizandoEstado = ref(false);
  const errorActualizacion = ref(null);
  const ultimaActualizacion = ref(null);

  async function crearEmpresa(datosEmpresa) {
    creando.value = true;
    errorCreacion.value = null;
    empresaCreada.value = null;
    try {
      const { data: respuesta } = await operadorEmpresaServicio.crear(datosEmpresa);
      empresaCreada.value = respuesta.data;
      return true;
    } catch (err) {
      errorCreacion.value = err.mensaje;
      return false;
    } finally {
      creando.value = false;
    }
  }

  async function suspenderEmpresa(empresaId, motivo) {
    actualizandoEstado.value = true;
    errorActualizacion.value = null;
    try {
      const { data: respuesta } = await operadorEmpresaServicio.suspender(empresaId, motivo);
      ultimaActualizacion.value = respuesta.data.empresa;
      return true;
    } catch (err) {
      errorActualizacion.value = err.mensaje;
      return false;
    } finally {
      actualizandoEstado.value = false;
    }
  }

  async function reactivarEmpresa(empresaId) {
    actualizandoEstado.value = true;
    errorActualizacion.value = null;
    try {
      const { data: respuesta } = await operadorEmpresaServicio.reactivar(empresaId);
      ultimaActualizacion.value = respuesta.data.empresa;
      return true;
    } catch (err) {
      errorActualizacion.value = err.mensaje;
      return false;
    } finally {
      actualizandoEstado.value = false;
    }
  }

  return {
    creando,
    errorCreacion,
    empresaCreada,
    actualizandoEstado,
    errorActualizacion,
    ultimaActualizacion,
    crearEmpresa,
    suspenderEmpresa,
    reactivarEmpresa,
  };
});
