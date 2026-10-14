import { defineStore } from "pinia";
import { ref } from "vue";
import empresaServicio from "@/servicios/empresa.servicio";

export const useEmpresaStore = defineStore("empresa", () => {
  const empresa = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  async function cargarEmpresa() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await empresaServicio.obtenerPropia();
      empresa.value = respuesta.data.empresa;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function actualizarEmpresa(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await empresaServicio.actualizarPropia(datos);
      empresa.value = respuesta.data.empresa;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  return { empresa, cargando, error, guardando, errorGuardado, cargarEmpresa, actualizarEmpresa };
});
