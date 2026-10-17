<script setup>
import { onBeforeUnmount, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { PhListBullets, PhListNumbers, PhQuotes, PhTextB, PhTextHOne, PhTextHThree, PhTextHTwo, PhTextItalic, PhTextStrikethrough } from "@phosphor-icons/vue";

// Guarda HTML — el backend lo sanitiza igual al guardar (ver sanitizarHtmlPlantilla.util.js en
// el backend), así que las etiquetas que esta barra de herramientas produce deben coincidir con
// las que el backend permite: p, strong, em, s, h1-h3, ul/ol/li, blockquote. Si se agrega un botón
// nuevo aquí, hay que agregar la etiqueta correspondiente también del lado del backend.
const modelo = defineModel({ type: String, default: "" });

const props = defineProps({
  label: { type: String, default: "" },
  variables: { type: Array, default: () => [] }, // [{ variable, descripcion }]
});

const editor = useEditor({
  content: modelo.value,
  extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false, code: false, horizontalRule: false })],
  editorProps: { attributes: { class: "editor-enriquecido-contenido" } },
  onUpdate: ({ editor: instancia }) => {
    modelo.value = instancia.getHTML();
  },
});

// Si el padre cambia el modelo por fuera (ej. al abrir "Editar" con otra plantilla), el editor
// debe reflejarlo — pero sin pisar lo que el usuario está escribiendo (de ahí la comparación).
watch(modelo, (nuevoValor) => {
  if (editor.value && nuevoValor !== editor.value.getHTML()) {
    editor.value.commands.setContent(nuevoValor, false);
  }
});

function insertarVariable(evento) {
  const variable = evento.target.value;
  if (variable) editor.value?.chain().focus().insertContent(`{{${variable}}}`).run();
  evento.target.value = "";
}

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-texto">{{ label }}</label>

    <div class="overflow-hidden rounded-xl border border-borde-fuerte bg-fondo-elevado">
      <div class="flex flex-wrap items-center gap-0.5 border-b border-borde bg-fondo p-1.5">
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('bold') }"
          title="Negrita"
          aria-label="Negrita"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <PhTextB class="size-4" weight="bold" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('italic') }"
          title="Cursiva"
          aria-label="Cursiva"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <PhTextItalic class="size-4" weight="bold" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('strike') }"
          title="Tachado"
          aria-label="Tachado"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <PhTextStrikethrough class="size-4" weight="bold" />
        </button>

        <span class="mx-1 h-5 w-px bg-borde" />

        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('heading', { level: 1 }) }"
          title="Título 1"
          aria-label="Título 1"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <PhTextHOne class="size-4" weight="bold" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('heading', { level: 2 }) }"
          title="Título 2"
          aria-label="Título 2"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <PhTextHTwo class="size-4" weight="bold" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('heading', { level: 3 }) }"
          title="Título 3"
          aria-label="Título 3"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <PhTextHThree class="size-4" weight="bold" />
        </button>

        <span class="mx-1 h-5 w-px bg-borde" />

        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('bulletList') }"
          title="Lista con viñetas"
          aria-label="Lista con viñetas"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <PhListBullets class="size-4" weight="bold" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('orderedList') }"
          title="Lista numerada"
          aria-label="Lista numerada"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <PhListNumbers class="size-4" weight="bold" />
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-texto-sutil transition-colors hover:bg-fondo-elevado hover:text-texto"
          :class="{ 'bg-acento/10 text-acento': editor?.isActive('blockquote') }"
          title="Cita"
          aria-label="Cita"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <PhQuotes class="size-4" weight="bold" />
        </button>

        <select
          v-if="variables.length > 0"
          class="ml-auto rounded-md border border-borde-fuerte bg-fondo-elevado px-2 py-1 text-xs text-texto"
          aria-label="Insertar variable"
          title="Insertar variable"
          @change="insertarVariable"
        >
          <option value="">+ Variable</option>
          <option v-for="variable in variables" :key="variable.variable" :value="variable.variable">{{ variable.descripcion }}</option>
        </select>
      </div>

      <EditorContent :editor="editor" class="px-4 py-3 text-sm text-texto" />
    </div>
  </div>
</template>

<style>
.editor-enriquecido-contenido {
  min-height: 280px;
  outline: none;
}
.editor-enriquecido-contenido h1 {
  margin: 0.6em 0 0.3em;
  font-size: 1.25rem;
  font-weight: 600;
}
.editor-enriquecido-contenido h2 {
  margin: 0.5em 0 0.3em;
  font-size: 1.1rem;
  font-weight: 600;
}
.editor-enriquecido-contenido h3 {
  margin: 0.4em 0 0.2em;
  font-size: 1rem;
  font-weight: 600;
}
.editor-enriquecido-contenido p {
  margin: 0 0 0.6em;
  line-height: 1.6;
}
.editor-enriquecido-contenido ul,
.editor-enriquecido-contenido ol {
  margin: 0 0 0.6em;
  padding-left: 1.3em;
}
.editor-enriquecido-contenido blockquote {
  margin: 0 0 0.6em;
  padding-left: 0.8em;
  border-left: 3px solid var(--color-borde-fuerte);
  color: var(--color-texto-sutil);
}
</style>
