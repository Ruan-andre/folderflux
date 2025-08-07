import { create } from "zustand";
import { FullRule } from "../../../shared/types/RuleWithDetails"; // ✅ Usa o tipo FullRule

type PopupRuleState = {
  isOpen: boolean;
  mode: "create" | "edit";
  ruleToEdit?: FullRule; // ✅ A regra para editar agora é uma FullRule
  openPopup: (mode: "create" | "edit", rule?: FullRule) => void;
  closePopup: () => void;
};

export const useRulePopupStore = create<PopupRuleState>((set) => ({
  isOpen: false,
  mode: "create",
  ruleToEdit: undefined,
  openPopup: (mode, rule) => set({ isOpen: true, mode, ruleToEdit: rule }),
  closePopup: () => set({ isOpen: false, ruleToEdit: undefined }),
}));
