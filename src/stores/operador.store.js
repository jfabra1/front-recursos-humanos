import { defineStore } from "pinia";
import { ref, computed } from "vue";
import operadorServicio from "@/servicios/operador.servicio";

// Estado del operador SaaS (panel de plataforma), separado por completo del estado
// de autenticación de usuarios de empresa (ver autenticacion.store.js). No comparten
// token ni se leen entre sí.
export const useOperadorStore = defineStore("operador", () => {
  const operador = ref(null);
  const token = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const estaAutenticado = computed(() => Boolean(token.value));

  async function iniciarSesion(credenciales) {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await operadorServicio.iniciarSesion(credenciales);
      token.value = respuesta.data.token;
      operador.value = respuesta.data.operador;
      return true;
    } catch (err) {
      error.value = err.mensaje;
      return false;
    } finally {
      cargando.value = false;
    }
  }

  // El backend no expone un endpoint de logout para operador (token sin estado,
  // sin cookie de refresh): cerrar sesión es solo limpiar el estado local.
  function cerrarSesion() {
    token.value = null;
    operador.value = null;
  }

  return { operador, token, cargando, error, estaAutenticado, iniciarSesion, cerrarSesion };
});
