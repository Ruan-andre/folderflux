import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTourStore } from "../store/tourStore";
import { waitForElement } from "../functions/waitForElement";

export const useTourSync = () => {
  const tour = useTourStore((state) => state.tour);
  const isTourActive = useTourStore((state) => state.isTourActive);
  const getCurrentStepId = useTourStore((state) => state.getCurrentStepId);

  const location = useLocation();

  useEffect(() => {
    if (!isTourActive() || !tour || !tour.currentStep) {
      return;
    }

    const syncTourStep = async () => {
      const currentStep = tour.currentStep;
      if (!currentStep || !currentStep.options.attachTo) return;

      const elementSelector = currentStep.options.attachTo.element;

      if (typeof elementSelector === "string") {
        try {
          tour.hide();
          await waitForElement(elementSelector);
          setTimeout(() => {
            tour.show(currentStep.id, true);
          }, 500); 
        } catch (error) {
          console.warn(
            `Tour não encontrou o alvo '${elementSelector}' na página ${location.pathname}.`,
            error
          );
          tour.cancel();
        }
      }
    };

    syncTourStep();
  }, [location, isTourActive, tour, getCurrentStepId]);
};
