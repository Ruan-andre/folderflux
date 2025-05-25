import { create } from "zustand";
import { RuleProps } from "../types/RulesProps";

type PopupRuleState = {
    isOpen: boolean;
    mode: "create" | "edit";
    ruleToEdit?: RuleProps | null;
    openPopup: (mode: "create" | "edit", rule?: RuleProps) => void;
    closePopup: () => void;
}

export const useRulePopupStore = create<PopupRuleState>((set) => ({
  isOpen: false,
  mode: "create",
  ruleToEdit: null,
  openPopup: (mode, rule) =>
    set({ isOpen: true, mode, ruleToEdit: rule ?? null }),
  closePopup: () => set({ isOpen: false, ruleToEdit: null }),
}));
