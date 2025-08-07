import { FullRule } from "~/src/shared/types/RuleWithDetails";
import FileInfo from "~/src/shared/types/FileInfo";
import { ICondition, IConditionGroup } from "~/src/shared/types/ConditionsType";
import path from "path";
import { getFilesInfo, moveFile } from "../services/fileService";

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
  // copy: async (file, destinationFolder) => {
  //   const newPath = path.join(file.parentDirectory, destinationFolder, file.nameWithExtension);
  //   // await copyFile(file.fullPath, newPath);
  // },
  // delete: async (file) => {
  //   // await deleteFile(file.fullPath);
  // },
  // rename: async (file, newName) => {
  //   const newPath = path.join(file.parentDirectory, `${newName}${file.extension}`);
  //   // await renameFile(file.fullPath, newPath);
  // },
};

async function evaluateAndAct(file: FileInfo, rules: FullRule[]) {
  for (const rule of rules) {
    if (handleConditions(file, rule.conditionsTree)) {
      const handler = actionHandlers[rule.action.type];
      const actionValue = rule.action.value ?? "";

      if (handler) {
        try {
          await handler(file, actionValue);
          // BUG CRÍTICO CORRIGIDO:
          // Se uma regra moveu/renomeou/deletou o arquivo, paramos de processar
          // mais regras para este arquivo para evitar erros de "arquivo não encontrado".
          console.log(
            `Ação '${rule.action.type}' aplicada ao arquivo '${file.nameWithExtension}' pela regra '${rule.name}'.`
          );
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

function handleConditions(file: FileInfo, conditionGroup: IConditionGroup): boolean {
  const conditions = conditionGroup.children as ICondition[];

  const evaluateCondition = (condition: ICondition): boolean => {
    const evaluator = conditionEvaluators[condition.field]?.[condition.operator];
    const fileValue = getFileValue(file, condition.field);

    if (evaluator && fileValue !== null) {
      return evaluator(fileValue, condition.value);
    }
    return false;
  };

  if (conditionGroup.operator === "OR") {
    return conditions.some(evaluateCondition);
  } else {
    return conditions.every(evaluateCondition);
  }
}

export default RuleEngine;
