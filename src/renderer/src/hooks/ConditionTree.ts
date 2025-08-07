import { useImmer } from "use-immer";
import { IConditionGroup, ICondition } from "../../../shared/types/ConditionsType";

// Função auxiliar recursiva que encontra um grupo pelo ID e o modifica
const findAndMutateGroup = (
  group: IConditionGroup,
  targetId: string | number,
  mutationCallback: (targetGroup: IConditionGroup) => void
): boolean => {
  if (group.id === targetId) {
    mutationCallback(group);
    return true;
  }
  for (const child of group.children) {
    if (child.type === "group") {
      if (findAndMutateGroup(child, targetId, mutationCallback)) {
        return true;
      }
    }
  }
  return false;
};

export const useConditionTree = (initialState: IConditionGroup) => {
  const [rootGroup, updateRootGroup] = useImmer<IConditionGroup>(initialState);
  const addNode = (parentId: string | number, type: "condition" | "group") => {
    updateRootGroup((draft) => {
      findAndMutateGroup(draft, parentId, (parentNode) => {
        if (type === "condition") {
          parentNode.children.push({
            id: crypto.randomUUID(),
            type: "condition",
            field: "fileName",
            operator: "contains",
            value: "",
          });
        } else {
          parentNode.children.push({
            id: crypto.randomUUID(),
            type: "group",
            operator: "AND",
            children: [],
          });
        }
      });
    });
  };

  const removeNode = (nodeId: string | number, parentId: string | number) => {
    updateRootGroup((draft) => {
      findAndMutateGroup(draft, parentId, (parentNode) => {
        parentNode.children = parentNode.children.filter((c) => c.id !== nodeId);
      });
    });
  };

  // ✅ CORRIGIDO: Agora trata a atualização do grupo raiz corretamente
  const updateNode = (
    nodeId: string | number,
    parentId: string | number,
    updatedNodeData: Partial<ICondition | IConditionGroup> // Aceita atualização parcial
  ) => {
    updateRootGroup((draft) => {
      // Caso especial: estamos atualizando o próprio grupo raiz
      if (nodeId === draft.id && (nodeId === parentId || parentId === "root")) {
        Object.assign(draft, updatedNodeData);
        return;
      }

      // Lógica para atualizar um nó filho
      findAndMutateGroup(draft, parentId, (parentNode) => {
        const nodeIndex = parentNode.children.findIndex((c) => c.id === nodeId);
        if (nodeIndex > -1) {
          // Mescla os dados antigos com os novos
          Object.assign(parentNode.children[nodeIndex], updatedNodeData);
        }
      });
    });
  };

  return { rootGroup, addNode, removeNode, updateNode, setRootGroup: updateRootGroup };
};
