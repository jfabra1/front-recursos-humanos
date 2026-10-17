import { defineStore } from "pinia";
import { ref } from "vue";
import empresaServicio from "@/servicios/empresa.servicio";
import archivoServicio from "@/servicios/archivo.servicio";

export const useEmpresaStore = defineStore("empresa", () => {
  const empresa = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  const guardando = ref(false);
  const errorGuardado = ref(null);

  // Vista previa del logo: el archivo vive detrás de autenticación (no es una URL pública), así
  // que no alcanza con un <img src="..."> directo — se pide como blob y se guarda un object URL
  // efímero, mismo patrón que la descarga de reportes/documentos.
  const logoUrl = ref(null);
  const subiendoLogo = ref(false);
  const errorLogo = ref(null);

  async function cargarLogoPreview() {
    if (logoUrl.value) {
      URL.revokeObjectURL(logoUrl.value);
      logoUrl.value = null;
    }
    if (!empresa.value?.logoArchivoId) return;
    try {
      const { data: blob } = await archivoServicio.descargar(empresa.value.logoArchivoId);
      logoUrl.value = URL.createObjectURL(blob);
    } catch {
      // Si el archivo ya no existe, se muestra simplemente sin logo — no es un error bloqueante.
    }
  }

  async function cargarEmpresa() {
    cargando.value = true;
    error.value = null;
    try {
      const { data: respuesta } = await empresaServicio.obtenerPropia();
      empresa.value = respuesta.data.empresa;
      await cargarLogoPreview();
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

  async function subirLogo(archivo) {
    subiendoLogo.value = true;
    errorLogo.value = null;
    try {
      const { data: subida } = await archivoServicio.subir(archivo);
      const exito = await actualizarEmpresa({ logoArchivoId: subida.data.archivo.id });
      if (exito) await cargarLogoPreview();
      return exito;
    } catch (err) {
      errorLogo.value = err.mensaje;
      return false;
    } finally {
      subiendoLogo.value = false;
    }
  }

  async function quitarLogo() {
    errorLogo.value = null;
    const exito = await actualizarEmpresa({ logoArchivoId: null });
    if (exito) await cargarLogoPreview();
    return exito;
  }

  return {
    empresa,
    cargando,
    error,
    guardando,
    errorGuardado,
    logoUrl,
    subiendoLogo,
    errorLogo,
    cargarEmpresa,
    actualizarEmpresa,
    subirLogo,
    quitarLogo,
  };
});
