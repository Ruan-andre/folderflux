import Shepherd from "shepherd.js";

import { TourState } from "../store/tourStore";

export const tourButtons = {
  back: {
    text: "Anterior",
    action(this: Shepherd.Tour) {
      this.back();
    },
    secondary: true,
  } as Shepherd.StepOptionsButton,

  next: {
    text: "Próximo",
    action(this: Shepherd.Tour) {
      this.next();
    },
  } as Shepherd.StepOptionsButton,

  complete: {
    text: "Finalizar",
    action(this: Shepherd.Tour) {
      this.complete();
    },
    classes: "btnEnd",
  } as Shepherd.StepOptionsButton,

  nextTour: {
    text: "Iniciar Tutorial Avançado",
    action(this: Shepherd.Tour & TourState) {
      this._startAdvancedTour?.();
    },
  } as Shepherd.StepOptionsButton,
};
