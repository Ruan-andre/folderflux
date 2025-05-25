import { create } from "zustand";
import { RuleProps } from "../types/RulesProps";
import { DbResponse } from "../types/DbResponse";
import { NewRule } from "~/src/db/schema";

type RuleState = {
  rules: RuleProps[];
  fetchRules: () => Promise<void>;
  addRule: (rule: NewRule) => Promise<DbResponse>;
  updateRule: (rule: RuleProps) => void;
  deleteRule: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<DbResponse>;
};

export const useRuleStore = create<RuleState>((set) => ({
  rules: [],

  fetchRules: async () => {
    const result = await window.api.rule.getAllRules();
    set({ rules: result?.items as RuleProps[] });
  },

  addRule: async (rule): Promise<DbResponse> => {
    const response = await window.api.rule.insertNewRule(rule);
    if (response.status && response.items) {
      const newRule = response?.items[0] as RuleProps;
      set((state) => ({
        rules: [...state.rules, newRule],
      }));
    }
    return response;
  },

  updateRule: (rule) => {
    set((state) => ({
      rules: state.rules.map((r) => (r.id === rule.id ? rule : r)),
    }));
  },

  deleteRule: async (id) => {
    const response = await window.api.rule.deleteRule(id);
    if (response.status) {
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== id),
      }));
    }
  },

  toggleActive: async (id) => {
    const response = await window.api.rule.toggleActive(id);
    if (response.status) {
      set((state) => ({
        rules: state.rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
      }));
    }
    return response;
  },
}));
