<script setup>
import { computed, onMounted } from "vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import { useSedesStore } from "@/stores/sedes.store";

// El valor es el `slug` de la sede (no el _id): todo lo sede-scoped de Jornada y
// asistencia arma sus URLs como `/v1/:empresaSlug/:sedeSlug/...`.
const modelo = defineModel({ type: String, default: "" });

const sedesStore = useSedesStore();

onMounted(() => {
  if (sedesStore.sedes.length === 0) sedesStore.cargarSedes();
});

const opciones = computed(() => sedesStore.sedes.filter((sede) => sede.activo).map((sede) => ({ valor: sede.slug, texto: sede.nombre })));
</script>

<template>
  <BaseSelect v-model="modelo" label="Sede" :opciones="opciones" placeholder="Selecciona una sede" />
</template>
