import { create } from "zustand";
import Shepherd from "shepherd.js";
import { NavigateFunction } from "react-router-dom";

import { simpleTourSteps, advancedTourSteps, CustomizedStepOptions } from "../config/tourSteps";
import { tourButtons } from "../config/tourButtons";

export interface TourState {
  tour: Shepherd.Tour | null;
  isAudioEnabled: boolean;
  isFinished: boolean;
  typeTour?: "simple" | "advanced";
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
  isFinished: false,
  stopCurrentAudio: () => {
    window.api.audio.stop();
  },
  toggleAudioEnabled: () => {
    const newState = !get().isAudioEnabled;
    set({ isAudioEnabled: newState });
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
      keyboardNavigation: false,
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

    const onTourEnd = async (event: Shepherd.EventOptions) => {
      get().stopCurrentAudio();
      if (event.index) {
        if (
          (event.tour.steps.length >= 60 && event.index >= 27 && get().typeTour === "advanced") ||
          (event.tour.steps.length >= 13 && event.index >= 7 && get().typeTour === "simple")
        )
          await window.api.tour.deleteData();
      }

      set({ isFinished: true });
      navigate("/");
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
        set({ isFinished: false, typeTour: type });
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
