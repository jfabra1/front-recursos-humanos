<script setup>
import { ref } from "vue";
import { PhDownloadSimple } from "@phosphor-icons/vue";
import BaseModal from "@/componentes/base/BaseModal.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import archivoServicio from "@/servicios/archivo.servicio";
import { ETIQUETAS_ESTADO_SOLICITUD_FIRMA, ETIQUETAS_EVENTO_FIRMA, ETIQUETAS_MEDIO_AUTENTICACION } from "@/utils/solicitudFirma.util";
import { formatoFechaHora } from "@/utils/formato.util";

const abierto = defineModel({ type: Boolean, default: false });

const props = defineProps({
  solicitud: { type: Object, default: null }, // documento completo de SolicitudFirma (ver SolicitudFirmaService)
});

const descargando = ref(false);
const errorDescargar = ref(null);

// Mismo patrón blob-download que reportes/plantillas — el archivo vive detrás de autenticación.
async function descargarArchivo(archivoId, nombreSugerido) {
  descargando.value = true;
  errorDescargar.value = null;
  try {
    const respuesta = await archivoServicio.descargar(archivoId);
    const disposicion = respuesta.headers["content-disposition"] ?? "";
    const nombreArchivo = /filename="(.+)"/.exec(disposicion)?.[1] || nombreSugerido;
    const url = URL.createObjectURL(respuesta.data);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    errorDescargar.value = err.mensaje;
  } finally {
    descargando.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="abierto" titulo="Evidencia de firma" ancho="lg">
    <template v-if="solicitud">
      <div class="flex items-center gap-2.5">
        <span class="rounded-full bg-acento/10 px-2.5 py-1 text-xs font-medium text-acento">{{ ETIQUETAS_ESTADO_SOLICITUD_FIRMA[solicitud.estado] }}</span>
        <span class="text-xs text-texto-sutil">Solicitud creada {{ formatoFechaHora(solicitud.createdAt) }} · vence {{ formatoFechaHora(solicitud.expiraEn) }}</span>
      </div>

      <div v-if="solicitud.firma" class="mt-5 rounded-xl border border-borde bg-fondo p-4">
        <h3 class="text-sm font-semibold text-texto">Datos de la firma</h3>
        <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-xs text-texto-sutil">Firmante</dt><dd class="text-texto">{{ solicitud.firma.nombreFirmante }}</dd></div>
          <div><dt class="text-xs text-texto-sutil">Documento</dt><dd class="text-texto">{{ solicitud.firma.documentoFirmante }}</dd></div>
          <div><dt class="text-xs text-texto-sutil">Fecha</dt><dd class="text-texto">{{ formatoFechaHora(solicitud.firma.fecha) }}</dd></div>
          <div><dt class="text-xs text-texto-sutil">Medio de autenticación</dt><dd class="text-texto">{{ ETIQUETAS_MEDIO_AUTENTICACION[solicitud.firma.medioAutenticacion] }}</dd></div>
          <div><dt class="text-xs text-texto-sutil">Dirección IP</dt><dd class="text-texto">{{ solicitud.firma.ip || "—" }}</dd></div>
          <div class="col-span-2">
            <dt class="text-xs text-texto-sutil">Dispositivo / navegador</dt>
            <dd class="truncate text-texto" :title="solicitud.firma.userAgent">{{ solicitud.firma.userAgent || "—" }}</dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs text-texto-sutil">Huella del documento firmado (SHA-256)</dt>
            <dd class="truncate font-mono text-xs text-texto" :title="solicitud.firma.hashDocumentoFirmado">{{ solicitud.firma.hashDocumentoFirmado }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-5">
        <h3 class="text-sm font-semibold text-texto">Línea de tiempo</h3>
        <ul class="mt-3 flex flex-col divide-y divide-borde rounded-xl border border-borde bg-fondo-elevado">
          <li v-for="(evento, indice) in solicitud.eventos" :key="indice" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <div>
              <p class="font-medium text-texto">{{ ETIQUETAS_EVENTO_FIRMA[evento.tipo] || evento.tipo }}</p>
              <p v-if="evento.detalle" class="text-xs text-texto-sutil">{{ evento.detalle }}</p>
            </div>
            <div class="shrink-0 text-right text-xs text-texto-sutil">
              <p>{{ formatoFechaHora(evento.fecha) }}</p>
              <p v-if="evento.ip">{{ evento.ip }}</p>
            </div>
          </li>
        </ul>
      </div>

      <BaseAlerta v-if="errorDescargar" tipo="error" class="mt-4">{{ errorDescargar }}</BaseAlerta>
      <div class="mt-5 flex flex-wrap gap-2">
        <BaseBoton
          v-if="solicitud.archivoFirmadoId"
          ancho="auto"
          variante="secundario"
          :cargando="descargando"
          @click="descargarArchivo(solicitud.archivoFirmadoId, 'documento-firmado.pdf')"
        >
          <PhDownloadSimple class="size-4" />
          Descargar documento firmado
        </BaseBoton>
        <BaseBoton
          v-else-if="solicitud.archivoGeneradoId"
          ancho="auto"
          variante="secundario"
          :cargando="descargando"
          @click="descargarArchivo(solicitud.archivoGeneradoId, 'documento.pdf')"
        >
          <PhDownloadSimple class="size-4" />
          Descargar documento (sin firmar)
        </BaseBoton>
      </div>
    </template>
  </BaseModal>
</template>
