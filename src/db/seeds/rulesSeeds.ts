import { NewFullRulePayload } from "~/src/shared/types/RuleWithDetails";

// Helper para gerar IDs para condições e grupos (não para Rule/Action IDs do DB)
const generateConditionId = (() => {
  let idCounter = 1;
  return () => idCounter++;
})();

// --- SEEDS DE REGRAS PADRÃO ---

// 1. Regra para Código
let displayOrderCount = 1;
export const ruleSeed_codigo: NewFullRulePayload = {
  rule: {
    name: "Organizar Arquivos de Código",
    description: "Move arquivos de código (scripts, markups, etc.) para a pasta 'CÓDIGO'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        fieldOperator: "equals",
        value: "py",
        field: "fileExtension",
        displayOrder: displayOrderCount,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "js",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "html",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "css",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "java",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "c",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "cpp",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "cs",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "php",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "json",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "xml",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "sh",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "bat",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "ps1",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "md",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "ts",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "go",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "rb",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "rs",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "swift",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "kt",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "tsx",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "CÓDIGO", // O nome da pasta a ser criada dentro da pasta monitorada
    ruleId: 0,
  },
};

displayOrderCount = 1;
// 2. Regra para Compactados
export const ruleSeed_compactados: NewFullRulePayload = {
  rule: {
    name: "Organizar Arquivos Compactados",
    description: "Move arquivos compactados (zip, rar, 7z, etc.) para a pasta 'COMPACTADOS'.",
    isSystem: true,
    isActive: true,
  },
  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "zip",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "rar",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "7z",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "tar",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "gz",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "bz2",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "xz",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "COMPACTADOS",
    ruleId: 0,
  },
};

displayOrderCount = 1;
// 3. Regra para PDFs
export const ruleSeed_pdf: NewFullRulePayload = {
  rule: {
    name: "Organizar Arquivos PDF",
    description: "Move arquivos .pdf para a pasta 'PDFs'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "AND",
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "pdf",
        displayOrder: displayOrderCount++,
      },
    ],
    displayOrder: displayOrderCount++,
  },

  action: {
    type: "move",
    value: "PDFs",
    ruleId: 0,
  },
};

displayOrderCount = 1;
// 4. Regra para Áudio
export const ruleSeed_audio: NewFullRulePayload = {
  rule: {
    name: "Organizar Arquivos de Áudio",
    description: "Move arquivos de áudio (mp3, wav, etc.) para a pasta 'ÁUDIO'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "mp3",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "wav",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "flac",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "aac",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "ogg",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "wma",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "m4a",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "ÁUDIO",
    ruleId: 0,
  },
};

displayOrderCount = 1;
// 5. Regra para Imagem
export const ruleSeed_imagem: NewFullRulePayload = {
  rule: {
    name: "Organizar Imagens",
    description: "Move arquivos de imagem (jpg, png, etc.) para a pasta 'IMAGENS'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "jpg",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "jpeg",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "png",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "gif",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "bmp",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "tiff",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "webp",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "svg",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "heic",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "IMAGENS",
    ruleId: 0,
  },
};
displayOrderCount = 1;

// 6. Regra para Vídeo
export const ruleSeed_video: NewFullRulePayload = {
  rule: {
    name: "Organizar Vídeos",
    description: "Move arquivos de vídeo (mp4, mov, etc.) para a pasta 'VÍDEOS'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "mp4",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "mov",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "avi",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "mkv",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "wmv",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "flv",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "webm",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "m4v",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "3gp",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "VÍDEOS",
    ruleId: 0,
  },
};
displayOrderCount = 1;

// 7. Regra para Documentos (Geral)
export const ruleSeed_documento: NewFullRulePayload = {
  rule: {
    name: "Organizar Documentos Gerais",
    description: "Move documentos de texto (doc, docx, txt, etc.) para a pasta 'DOCUMENTOS'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "doc",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "docx",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "odt",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "txt",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "rtf",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "pages",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "DOCUMENTOS",
    ruleId: 0,
  },
};
displayOrderCount = 1;

// 8. Regra para Planilhas
export const ruleSeed_planilha: NewFullRulePayload = {
  rule: {
    name: "Organizar Planilhas",
    description: "Move arquivos de planilha (xls, xlsx, csv, etc.) para a pasta 'PLANILHAS'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "xls",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "xlsx",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "ods",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "csv",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "PLANILHAS",
    ruleId: 0,
  },
};
displayOrderCount = 1;

// 9. Regra para Apresentações
export const ruleSeed_apresentacao: NewFullRulePayload = {
  rule: {
    name: "Organizar Apresentações",
    description: "Move arquivos de apresentação (ppt, pptx, etc.) para a pasta 'APRESENTAÇÕES'.",
    isSystem: true,
    isActive: true,
  },

  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "ppt",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "pptx",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "odp",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "key",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "APRESENTAÇÕES",
    ruleId: 0,
  },
};

displayOrderCount = 1;
// 10. Regra para Executáveis
export const ruleSeed_executaveis: NewFullRulePayload = {
  rule: {
    name: "Organizar Executáveis e Instaladores",
    description: "Move executáveis e instaladores (exe, msi, dmg, etc.) para a pasta 'EXECUTÁVEIS'.",
    isSystem: true,
    isActive: true,
  },
  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    displayOrder: displayOrderCount,
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "exe",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "msi",
        displayOrder: displayOrderCount++,
      },

      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "dmg",
        displayOrder: displayOrderCount++,
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "app",
        displayOrder: displayOrderCount++,
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "deb",
        displayOrder: displayOrderCount++,
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        fieldOperator: "equals",
        value: "rpm",
        displayOrder: displayOrderCount++,
      },
    ],
  },

  action: {
    type: "move",
    value: "EXECUTÁVEIS",
    ruleId: 0,
  },
};

// Array com todos os seeds de regras para facilitar a importação e inserção
export const allRuleSeeds: NewFullRulePayload[] = [
  ruleSeed_codigo,
  ruleSeed_compactados,
  ruleSeed_pdf,
  ruleSeed_audio,
  ruleSeed_imagem,
  ruleSeed_video,
  ruleSeed_documento,
  ruleSeed_planilha,
  ruleSeed_apresentacao,
  ruleSeed_executaveis,
];
