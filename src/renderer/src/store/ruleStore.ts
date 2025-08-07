import { create } from "zustand";
import { DbResponse } from "../../../shared/types/DbResponse";
import { RuleSchema } from "~/src/db/schema";
import { FullRule, NewFullRulePayload } from "../../../shared/types/RuleWithDetails";

type RuleState = {
  rules: FullRule[];
  getRules: () => Promise<void>;
  addRule: (data: NewFullRulePayload) => Promise<DbResponse<FullRule>>;
  duplicateRule: (ruleId: number) => Promise<DbResponse>; // Não precisa retornar, getRules será chamado
  updateRule: (ruleData: RuleSchema) => Promise<DbResponse>;
  deleteRule: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<DbResponse>;
};

export const useRuleStore = create<RuleState>((set) => ({
  rules: [],

  getRules: async () => {
    const result = await window.api.rule.getAllRules();
    if (result.status && result.items) {
      set({ rules: result.items });
    }
  },

  addRule: async (data): Promise<DbResponse<FullRule>> => {
    const response = await window.api.rule.createFullRule(data);
    if (response.status && response.items) {
      const newFullRule = response.items;
      set((state) => ({
        rules: [...state.rules, newFullRule],
      }));
    }
    return response;
  },

  duplicateRule: async (id): Promise<DbResponse> => {
    const response = await window.api.rule.duplicateRule(id);
    if (response.status && response.items) {
      const newFullRule = response.items;
      set((state) => ({
        rules: [...state.rules, newFullRule],
      }));
    }
    return response;
    // Retornamos a resposta, mas o refresh será feito pela view que chamou
    // return response; // Este retorno não é estritamente necessário se a UI recarregar
  },

  updateRule: async (ruleData): Promise<DbResponse> => {
    const response = await window.api.rule.updateRule(ruleData);
    if (response.status) {
      // Atualiza apenas os dados básicos da regra, preservando a árvore
      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleData.id ? { ...r, ...ruleData } : r)),
      }));
    }
    return response;
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
