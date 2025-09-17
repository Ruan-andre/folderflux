import { useEffect } from "react";

export function useReloadShortcut() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // F5 ou Ctrl+R
      if (e.key === "F5" || (e.key.toLowerCase() === "r" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        if (window.api && window.api.app) {
          window.electron?.ipcRenderer?.send?.("window:reload");
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
