// Em: src/store/tourStore.ts
import { create } from "zustand";
import Shepherd from "shepherd.js";
import { NavigateFunction } from "react-router-dom";

// Importe os passos que acabamos de criar
import { simpleTourSteps, advancedTourSteps, CustomizedStepOptions } from "../config/tourSteps";
import { tourButtons } from "../config/tourButtons";

export interface TourState {
  tour: Shepherd.Tour | null;
  initializeTour: (navigate: NavigateFunction) => void;
  startTour: (type: "simple" | "advanced") => void;
  tourNext: () => void;
  getCurrentStepId: () => string | undefined;
  isTourActive: () => boolean;
  _startAdvancedTour: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  tour: null,

  initializeTour: (navigate) => {
    // Evita reinicializar
    if (get().tour) return;

    const newTour = new Shepherd.Tour({
      useModalOverlay: true,
      exitOnEsc: false,
      defaultStepOptions: {
        scrollTo: false,
        cancelIcon: { enabled: true },
        canClickTarget: false,
        buttons: [tourButtons.back, tourButtons.next],
      },
    });

    (newTour as Shepherd.Tour & TourState)._startAdvancedTour = () => {
      setTimeout(() => {
        get().startTour("advanced");
      }, 150);
    };

    // Eventos principais
    newTour.on("complete", () => localStorage.setItem("folderfluxTourCompleted", "true"));
    newTour.on("cancel", () => localStorage.setItem("folderfluxTourCompleted", "true"));

    newTour.on("hide", ({ step }) => {
      const handlerData = step._advanceOnHandler;
      if (handlerData) {
        handlerData.element.removeEventListener(handlerData.event, handlerData.handler);
        delete step._advanceOnHandler;
      }
    });

    // Lógica de navegação para o tour avançado
    newTour.on("show", (event) => {
      const { step } = event;
      const { page, advanceOn } = step.options as CustomizedStepOptions;
      if (page && window.location.pathname !== page) {
        navigate(page);
      }

      if (advanceOn) {
        const targetElement = document.querySelector(advanceOn.selector);
        if (targetElement && advanceOn.handler) {
          targetElement.addEventListener(advanceOn.event, () => {
            if (advanceOn.handler) advanceOn.handler(step.tour);
          });
        } else if (targetElement) {
          const handler = () => {
            setTimeout(() => {
              get().tour?.next();
            }, 300);
          };
          targetElement.addEventListener(advanceOn.event, handler);
          step._advanceOnHandler = {
            element: targetElement,
            event: advanceOn.event,
            handler,
          };
        }
        step.on("hide", () => {
          const handlerData = step._advanceOnHandler;
          if (handlerData) {
            handlerData.element.removeEventListener(handlerData.event, handlerData.handler);
            delete step._advanceOnHandler;
          }
        });
      }
    });

    set({ tour: newTour });
  },

  startTour: (type) => {
    const tour = get().tour;
    if (tour) {
      if (tour.isActive()) {
        tour.cancel();
      }
      localStorage.removeItem("folderfluxTourCompleted");
      const steps = type === "simple" ? simpleTourSteps : advancedTourSteps;
      tour.steps = [];
      tour.addSteps(steps);
      setTimeout(() => {
        tour.start();
      }, 150);
    }
  },

  tourNext: () => {
    get().tour?.next();
  },

  getCurrentStepId: () => {
    return get().tour?.currentStep?.id;
  },

  isTourActive: () => {
    return get().tour?.isActive() ?? false;
  },
  _startAdvancedTour: () => {
    console.log("iniciado");
    // Ação interna que chama startTour, apenas para tipagem.
    // A lógica real está anexada na instância do tour.
  },
}));
