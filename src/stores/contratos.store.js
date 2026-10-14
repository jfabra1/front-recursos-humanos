import { defineStore } from "pinia";
import { ref, computed } from "vue";
import contratoServicio from "@/servicios/contrato.servicio";

export const useContratosStore = defineStore("contratos", () => {
  const historial = ref([]);
  const empleadoIdActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  const contratoVigente = computed(() => historial.value.find((contrato) => contrato.vigente) ?? null);

  const porVencer = ref([]);
  const cargandoPorVencer = ref(false);
  const errorPorVencer = ref(null);

  async function cargarHistorial(empleadoId) {
    empleadoIdActual.value = empleadoId;
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await contratoServicio.historialPorEmpleado(empleadoId);
      historial.value = respuesta.data.historial;
    } catch (err) {
      error.value = err.mensaje;
    } finally {
      cargando.value = false;
    }
  }

  async function crearContrato(datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await contratoServicio.crear(datos);
      historial.value.unshift(respuesta.data.contrato);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function renovarContrato(contratoId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await contratoServicio.renovar(contratoId, datos);
      const anterior = historial.value.find((contrato) => contrato._id === contratoId);
      if (anterior) anterior.vigente = false;
      historial.value.unshift(respuesta.data.contrato);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function cargarPorVencer(dias) {
    cargandoPorVencer.value = true;
    errorPorVencer.value = null;
    try {
      const { data: respuesta } = await contratoServicio.porVencer(dias);
      porVencer.value = respuesta.data.contratos;
    } catch (err) {
      errorPorVencer.value = err.mensaje;
    } finally {
      cargandoPorVencer.value = false;
    }
  }

  return {
    historial,
    empleadoIdActual,
    cargando,
    error,
    guardando,
    errorGuardado,
    contratoVigente,
    porVencer,
    cargandoPorVencer,
    errorPorVencer,
    cargarHistorial,
    crearContrato,
    renovarContrato,
    cargarPorVencer,
  };
});
