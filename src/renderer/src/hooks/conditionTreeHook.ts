import { useImmer } from "use-immer";
import { IConditionGroup, ICondition } from "../../../shared/types/ConditionsType";

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
        parentNode.children.push(
          type === "condition"
            ? {
                id: crypto.randomUUID(),
                type: "condition",
                field: "fileName",
                fieldOperator: "contains",
                value: "",
                displayOrder: parentNode.children.length + 1,
              }
            : {
                id: crypto.randomUUID(),
                type: "group",
                operator: "AND",
                children: [],
                displayOrder: parentNode.children.length + 1,
              }
        );
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

  const updateNode = (
    nodeId: string | number,
    parentId: string | number,
    updatedNodeData: Partial<ICondition | IConditionGroup>
  ) => {
    updateRootGroup((draft) => {
      if (nodeId === draft.id && (nodeId === parentId || parentId === "root")) {
        Object.assign(draft, updatedNodeData);
        return;
      }

      findAndMutateGroup(draft, parentId, (parentNode) => {
        const nodeIndex = parentNode.children.findIndex((c) => c.id === nodeId);
        if (nodeIndex > -1) {
          Object.assign(parentNode.children[nodeIndex], updatedNodeData);
        }
      });
    });
  };

  return {
    rootGroup,
    addNode,
    removeNode,
    updateNode,
    setRootGroup: updateRootGroup,
  };
};
