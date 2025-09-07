// Em: src/store/tourStore.ts
import { create } from "zustand";
import Shepherd from "shepherd.js";
import { NavigateFunction } from "react-router-dom";

// Importe os passos que acabamos de criar
import { simpleTourSteps, advancedTourSteps, CustomizedStepOptions } from "../config/tourSteps";
import { tourButtons } from "../config/tourButtons";

export interface TourState {
  tour: Shepherd.Tour | null;
  isAudioEnabled: boolean;
  toggleAudioEnabled: () => void;
  initializeTour: (navigate: NavigateFunction, initialAudioState: boolean) => void;
  startTour: (type: "simple" | "advanced") => void;
  tourNext: () => void;
  getCurrentStepId: () => string | undefined;
  isTourActive: () => boolean;
  stopCurrentAudio: () => void;
}

function speak(text: string) {
  window.api.audio.play(text);
}

export const useTourStore = create<TourState>((set, get) => ({
  tour: null,
  isAudioEnabled: true,
  stopCurrentAudio: () => {
    window.api.audio.stop();
  },
  toggleAudioEnabled: () => {
    const newState = !get().isAudioEnabled;
    // TODO: Aqui você chamará a função para salvar 'newState' no seu banco de dados.
    // Ex: window.api.settings.setAudioEnabled(newState);
    set({ isAudioEnabled: newState });

    // Se o áudio for desativado, para qualquer som que esteja tocando
    if (!newState) {
      window.api.audio.stop();
    }
  },
  initializeTour: (navigate, initialAudioState) => {
    // Evita reinicializar
    if (get().tour) return;

    set({ isAudioEnabled: initialAudioState });

    const newTour = new Shepherd.Tour({
      useModalOverlay: true,
      exitOnEsc: true,
      defaultStepOptions: {
        scrollTo: false,
        cancelIcon: { enabled: true },
        canClickTarget: false,
        buttons: [tourButtons.back, tourButtons.next],
      },
    });

    (newTour as Shepherd.Tour & TourState)._startAdvancedTour = () => {
      get().startTour("advanced");
    };

    newTour.on("show", async (event) => {
      const { step } = event;
      const { options } = step;
      const { page } = options as CustomizedStepOptions;

      if (page && window.location.pathname !== page) {
        navigate(page);
        return;
      }

      const textToSpeak = step.options.text
        ? new DOMParser().parseFromString(step.options.text as string, "text/html").body.textContent || ""
        : "";
      if (textToSpeak && get().isAudioEnabled) {
        get().stopCurrentAudio();
        speak(textToSpeak);
      }
    });

    const onTourEnd = () => {
      get().stopCurrentAudio();
    };

    newTour.on("complete", onTourEnd);
    newTour.on("cancel", onTourEnd);
    newTour.on("hide", () => window.api.audio.stop());

    set({ tour: newTour });
  },

  startTour: (type) => {
    const tour = get().tour;
    if (tour) {
      if (tour.isActive()) {
        tour.cancel();
      }
      // localStorage.removeItem("folderfluxTourCompleted");
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
  _startAdvancedTour: () => get().startTour("advanced"),
}));
