import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useTourStore } from "../store/tourStore";

export function useHowToUse(navigateToHome = false) {
  const { showConfirm } = useConfirmDialog();
  const navigate = useNavigate();
  const startTour = useTourStore((state) => state.startTour);

  const handleHowToUse = () => {
    const launchTour = (type: "simple" | "advanced") => {
      if (navigateToHome) {
        navigate("/");
        // Aguarda a HomePage montar antes de o Shepherd tentar ancorar no #how-to-use-card.
        // 300 ms causava race condition — a navegação ainda não tinha concluído o render.
        setTimeout(() => startTour(type), 1000);
      } else {
        startTour(type);
      }
    };

    showConfirm(
      {
        title: "Escolha uma opção",
        confirmText: "Tutorial Simples",
        confirmBtnColor: "success",
      },
      () => launchTour("simple"),
      [
        {
          text: "Tutorial Avançado",
          action: () => launchTour("advanced"),
          thirdButtonColor: "error",
        },
      ]
    );
  };

  return { handleHowToUse };
}
