import { defineStore } from "pinia";
import { ref } from "vue";
import autogestionServicio from "@/servicios/autogestion.servicio";

export const useAutogestionStore = defineStore("autogestion", () => {
  const empleado = ref(null);
  const contratoVigente = ref(null);
  const cargandoPerfil = ref(false);
  const errorPerfil = ref(null);

  const documentos = ref([]);
  const cargandoDocumentos = ref(false);
  const errorDocumentos = ref(null);

  const turnos = ref([]);
  const cargandoTurnos = ref(false);
  const errorTurnos = ref(null);

  const politica = ref(null);
  const cargandoPolitica = ref(false);
  const errorPolitica = ref(null);

  async function cargarPerfil() {
    cargandoPerfil.value = true;
    errorPerfil.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.obtenerPerfil();
      empleado.value = respuesta.data.empleado;
      contratoVigente.value = respuesta.data.contratoVigente;
    } catch (err) {
      errorPerfil.value = err.mensaje;
    } finally {
      cargandoPerfil.value = false;
    }
  }

  async function cargarDocumentos() {
    cargandoDocumentos.value = true;
    errorDocumentos.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.listarDocumentos();
      documentos.value = respuesta.data.documentos;
    } catch (err) {
      errorDocumentos.value = err.mensaje;
    } finally {
      cargandoDocumentos.value = false;
    }
  }

  async function cargarTurnos(filtros = {}) {
    cargandoTurnos.value = true;
    errorTurnos.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.listarTurnos(filtros);
      turnos.value = respuesta.data.turnos;
    } catch (err) {
      errorTurnos.value = err.mensaje;
    } finally {
      cargandoTurnos.value = false;
    }
  }

  async function cargarPolitica() {
    cargandoPolitica.value = true;
    errorPolitica.value = null;
    try {
      const { data: respuesta } = await autogestionServicio.obtenerPrivacidad();
      politica.value = respuesta.data.politica;
    } catch (err) {
      errorPolitica.value = err.mensaje;
    } finally {
      cargandoPolitica.value = false;
    }
  }

  return {
    empleado,
    contratoVigente,
    cargandoPerfil,
    errorPerfil,
    cargarPerfil,
    documentos,
    cargandoDocumentos,
    errorDocumentos,
    cargarDocumentos,
    turnos,
    cargandoTurnos,
    errorTurnos,
    cargarTurnos,
    politica,
    cargandoPolitica,
    errorPolitica,
    cargarPolitica,
  };
});
