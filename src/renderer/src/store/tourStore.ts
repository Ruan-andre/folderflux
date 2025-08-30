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
        scrollTo: true,
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

    // Lógica de navegação para o tour avançado
    newTour.on("show", (event) => {
      const { step, tour: thisTour } = event;
      const { page } = step.options as CustomizedStepOptions;
      if (page && window.location.pathname !== page) {
        navigate(page);
      }
      if (step.id === "trigger-advanced-tour") {
        thisTour.complete();
        get().startTour("advanced");
        return;
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
