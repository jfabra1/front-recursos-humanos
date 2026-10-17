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
  // Un otrosí registrado pero aún sin confirmar: no es vigente todavía (el contrato anterior
  // sigue siéndolo) — ver ContratoService.renovar/confirmarOtrosi en el backend. Solo puede
  // existir uno a la vez por contrato (el backend lo impide).
  const otrosiBorrador = computed(() => historial.value.find((contrato) => contrato.confirmado === false) ?? null);

  // Alerta informativa (nunca bloquea nada): cuántas prórrogas de un CTF < 1 año lleva este
  // contrato, por si la que se está por registrar excedería el tope legal de 3.
  const alertaOtrosi = ref(null);

  async function cargarAlertaOtrosi(contratoId) {
    alertaOtrosi.value = null;
    try {
      const { data: respuesta } = await contratoServicio.alertaOtrosi(contratoId);
      alertaOtrosi.value = respuesta.data.alerta;
    } catch {
      // Puramente informativo — si falla, simplemente no se muestra ninguna alerta.
    }
  }

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

  // El contrato anterior NO se toca aquí — sigue vigente hasta confirmarOtrosi(). El nuevo entra
  // al historial como borrador (confirmado:false, vigente:false).
  async function renovarContrato(contratoId, datos) {
    guardando.value = true;
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await contratoServicio.renovar(contratoId, datos);
      historial.value.unshift(respuesta.data.contrato);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    } finally {
      guardando.value = false;
    }
  }

  async function confirmarOtrosi(contratoId) {
    errorGuardado.value = null;
    try {
      const { data: respuesta } = await contratoServicio.confirmarOtrosi(contratoId);
      const anterior = historial.value.find((contrato) => contrato._id === respuesta.data.contrato.contratoAnteriorId);
      if (anterior) anterior.vigente = false;
      const indice = historial.value.findIndex((contrato) => contrato._id === contratoId);
      if (indice !== -1) historial.value[indice] = respuesta.data.contrato;
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
    }
  }

  async function descartarOtrosi(contratoId) {
    errorGuardado.value = null;
    try {
      await contratoServicio.descartarOtrosi(contratoId);
      historial.value = historial.value.filter((contrato) => contrato._id !== contratoId);
      return true;
    } catch (err) {
      errorGuardado.value = err.mensaje;
      return false;
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
    otrosiBorrador,
    alertaOtrosi,
    cargarAlertaOtrosi,
    porVencer,
    cargandoPorVencer,
    errorPorVencer,
    cargarHistorial,
    crearContrato,
    renovarContrato,
    confirmarOtrosi,
    descartarOtrosi,
    cargarPorVencer,
  };
});
