import { useDark, useToggle } from "@vueuse/core";

/**
 * Tema oscuro/claro persistido en localStorage, con `.dark` sobre <html>
 * y respeto inicial de prefers-color-scheme (comportamiento por defecto de useDark).
 */
export function usePreferenciasTema() {
  const esOscuro = useDark({
    selector: "html",
    attribute: "class",
    valueDark: "dark",
    valueLight: "",
    storageKey: "sgth-tema",
  });
  const alternarTema = useToggle(esOscuro);

  return { esOscuro, alternarTema };
}
