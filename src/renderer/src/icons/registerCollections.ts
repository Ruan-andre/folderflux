// Registra coleções Iconify mínimas geradas em build-icons.mjs
import { addCollection } from "@iconify/react";
import type { IconifyJSON } from "@iconify/types";

export function registerIconCollections() {
  // Carrega todos os JSONs gerados dinamicamente da pasta .generated
  const modules = import.meta.glob("./.generated/*.json", { eager: true }) as Record<string, { default: IconifyJSON } | IconifyJSON>;

  const toJSON = (m: { default: IconifyJSON } | IconifyJSON): IconifyJSON => {
    return (m as { default: IconifyJSON }).default ?? (m as IconifyJSON);
  };

  Object.values(modules).forEach((mod) => {
    try {
      const data = toJSON(mod);
      if (data && (data as unknown as { icons?: unknown }).icons) {
        addCollection(data);
      }
    } catch {
      // ignora entradas inválidas
    }
  });
}

registerIconCollections();
