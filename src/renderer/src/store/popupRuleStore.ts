import { create } from "zustand";
import { FullRule } from "../../../shared/types/RuleWithDetails"; 

type PopupRuleState = {
  isOpen: boolean;
  mode: "create" | "edit";
  ruleToEdit?: FullRule; 
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
