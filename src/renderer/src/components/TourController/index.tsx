import { useCallback, useEffect } from "react";
import { useTourStore } from "../../store/tourStore";
import { createRoot, Root } from "react-dom/client";
import React from "react";
import Shepherd from "shepherd.js";
import TourAudioButton from "../TourAudioButton";
import { waitForElement } from "../../functions/waitForElement";

export const TourController = () => {
  const tour = useTourStore((state) => state.tour);
  const startTour = useTourStore((state) => state.startTour);

  const handleShow = useCallback(({ step }: { step: Shepherd.Step }) => {
    setTimeout(() => {
      if (!step.el) return;

      const header = step.el.querySelector(".shepherd-header");
      if (header) {
        const mountPoint = document.createElement("div");
        header.prepend(mountPoint);

        const root = createRoot(mountPoint);
        root.render(
          <React.StrictMode>
            <TourAudioButton />
          </React.StrictMode>
        );

        step.options._reactRoot = root;
      }
    }, 0);
  }, []);

  const handleHide = useCallback(({ step }: { step: Shepherd.Step }) => {
    const root = step.options._reactRoot as Root | undefined;
    if (root) {
      root.unmount();
      delete step.options._reactRoot;
    }
  }, []);

  const FirstTimeTourManager = useCallback(async () => {
    const tourHasBeenExecuted = await window.api.ElectronStore.get("tourHasBeenExecuted");
    if (tourHasBeenExecuted === undefined || tourHasBeenExecuted === "false") {
      await waitForElement("#how-to-use-card");
      startTour("simple");
      await window.api.ElectronStore.set("tourHasBeenExecuted", "true");
    }

    return null;
  }, [startTour]);

  useEffect(() => {
    if (!tour) return;
    tour.on("show", handleShow);
    tour.on("hide", handleHide);
    FirstTimeTourManager();
    return () => {
      tour.off("show", handleShow);
      tour.off("hide", handleHide);
    };
  }, [FirstTimeTourManager, handleHide, handleShow, tour]);
  return null;
};
