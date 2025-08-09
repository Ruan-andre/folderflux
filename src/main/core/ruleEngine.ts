import { FullRule } from "~/src/shared/types/RuleWithDetails";
import FileInfo from "~/src/shared/types/FileInfo";
import { ICondition, IConditionGroup } from "~/src/shared/types/ConditionsType";
import path from "path";
import { copyFile, deleteFile, getFilesInfo, moveFile } from "../services/fileService";

type FileValue = string | number | Date;
type EvaluatorFunc = (fileValue: FileValue, conditionValue: string) => boolean;

const conditionEvaluators: Record<string, Record<string, EvaluatorFunc>> = {
  fileName: {
    contains: (fileName, value) => String(fileName).toLowerCase().includes(value.toLowerCase()),
    notContains: (fileName, value) => !String(fileName).toLowerCase().includes(value.toLowerCase()),
    startsWith: (fileName, value) => String(fileName).toLowerCase().startsWith(value.toLowerCase()),
    endsWith: (fileName, value) => String(fileName).toLowerCase().endsWith(value.toLowerCase()),
    equals: (fileName, value) => String(fileName).toLowerCase() === value.toLowerCase(),
  },
  fileExtension: {
    equals: (fileExt, value) => String(fileExt).toLowerCase() === value.toLowerCase().replace(".", ""),
    notEquals: (fileExt, value) => String(fileExt).toLowerCase() !== value.toLowerCase().replace(".", ""),
  },
  fileDate: {
    greaterThan: (fileDate, value) => new Date(fileDate) > new Date(value),
    lessThan: (fileDate, value) => new Date(fileDate) < new Date(value),
  },
  fileSize: {
    greaterThan: (fileSize, value) => Number(fileSize) > parseFloat(value) * 1024 * 1024,
    lessThan: (fileSize, value) => Number(fileSize) < parseFloat(value) * 1024 * 1024,
  },
};

type ActionFunc = (file: FileInfo, actionValue: string) => Promise<void>;

const RuleEngine = {
  process: async (rules: FullRule[], folderPaths: string[]) => {
    console.log(`Iniciando processamento para ${folderPaths.length} pasta(s)...`);
    for (const folderPath of folderPaths) {
      try {
        const filesInformation = await getFilesInfo(folderPath);
        console.log(`Encontrados ${filesInformation.length} arquivos em '${folderPath}'.`);
        for (const file of filesInformation) {
          await evaluateAndAct(file, rules);
        }
      } catch (error) {
        console.error(`Erro ao processar a pasta '${folderPath}'`, error);
      }
    }
    console.log("Processamento concluído.");
  },
};

const actionHandlers: Record<string, ActionFunc> = {
  move: async (file, destinationFolder) => {
    const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
    await moveFile(file.fullPath, newPath);
  },
  copy: async (file, destinationFolder) => {
    const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
    await copyFile(file.fullPath, newPath);
  },
  delete: async (file) => {
    await deleteFile(file.fullPath);
  },
  rename: async (file, newName) => {
    const newPath = path.join(file.parentDirectory, `${newName}${file.extension}`);
    await moveFile(file.fullPath, newPath);
  },
};

async function evaluateAndAct(file: FileInfo, rules: FullRule[]) {
  for (const rule of rules) {
    if (handleConditions(file, rule.conditionsTree)) {
      const handler = actionHandlers[rule.action.type];
      const actionValue = rule.action.value ?? "";

      if (handler) {
        try {
          await handler(file, actionValue);
          return;
        } catch (error) {
          console.error(`Erro ao aplicar a ação '${rule.action.type}' no arquivo '${file.fullPath}'`, error);
        }
      }
    }
  }
}

function getFileValue(file: FileInfo, field: ICondition["field"]): FileValue | null {
  switch (field) {
    case "fileName":
      return file.name;
    case "fileExtension":
      return file.extension.replace(".", "");
    case "fileSize":
      return file.size;
    case "creationDate":
      return file.ctime;
    case "modifiedDate":
      return file.mtime;
    default:
      return null;
  }
}
const evaluateCondition = (condition: ICondition, file: FileInfo): boolean => {
  const evaluator = conditionEvaluators[condition.field]?.[condition.fieldOperator];
  const fileValue = getFileValue(file, condition.field);

  if (evaluator && fileValue !== null) {
    return evaluator(fileValue, condition.value);
  }
  return false;
};

function handleConditions(file: FileInfo, conditionGroup: IConditionGroup): boolean {
  if (conditionGroup.operator === "OR") {
    for (const child of conditionGroup.children) {
      if (child.type === "condition") {
        if (evaluateCondition(child, file)) return true;
      } else {
        if (handleConditions(file, child)) return true;
      }
    }
    return false;
  } else {
    for (const child of conditionGroup.children) {
      if (child.type === "condition") {
        if (!evaluateCondition(child, file)) return false;
      } else {
        if (!handleConditions(file, child)) return false;
      }
    }
    return true;
  }
}

export default RuleEngine;
