// Em: src/types/shepherd.d.ts

import "shepherd.js";
import { Root } from "react-dom/client";

// Estende os tipos do módulo 'shepherd.js'
declare module "shepherd.js" {
  interface Tour {
    _startAdvancedTour?: () => void;
  }

  interface StepOptions {
    page?: string;
    advanceOn?: {
      selector: string;
      event: keyof HTMLElementEventMap;
    };
    // Guarda a referência da raiz do React para limpeza (unmount)
    _reactRoot?: Root;
  }

  interface EventOptions {
    index?: number;
  }
}
