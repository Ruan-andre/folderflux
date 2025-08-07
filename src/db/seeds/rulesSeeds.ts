import { NewFullRulePayload } from "~/src/shared/types/RuleWithDetails";

// Helper para gerar IDs para condições e grupos (não para Rule/Action IDs do DB)
const generateConditionId = (() => {
  let idCounter = 1;
  return () => idCounter++;
})();

// --- SEEDS DE REGRAS PADRÃO ---

// 1. Regra para Código
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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "py",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "js",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "html",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "css",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "java",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "c",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "cpp",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "cs",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "php",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "json",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "xml",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "sh",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "bat",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "ps1",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "md",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "ts",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "go",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "rb",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "rs",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "swift",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "kt",
      },
       {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "tsx",
      },
    ],
  },
  action: {
    type: "move",
    value: "CÓDIGO", // O nome da pasta a ser criada dentro da pasta monitorada
    ruleId: 0, // Será preenchido pelo backend após a inserção da regra
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "zip",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "rar",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "7z",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "tar",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "gz",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "bz2",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "xz",
      },
    ],
  },
  action: {
    type: "move",
    value: "COMPACTADOS",
    ruleId: 0,
  },
};

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
        operator: "equals",
        value: "pdf",
      },
    ],
  },
  action: {
    type: "move",
    value: "PDFs",
    ruleId: 0,
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "mp3",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "wav",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "flac",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "aac",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "ogg",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "wma",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "m4a",
      },
    ],
  },
  action: {
    type: "move",
    value: "ÁUDIO",
    ruleId: 0,
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "jpg",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "jpeg",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "png",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "gif",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "bmp",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "tiff",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "webp",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "svg",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "heic",
      },
    ],
  },
  action: {
    type: "move",
    value: "IMAGENS",
    ruleId: 0,
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "mp4",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "mov",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "avi",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "mkv",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "wmv",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "flv",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "webm",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "m4v",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "3gp",
      },
    ],
  },
  action: {
    type: "move",
    value: "VÍDEOS",
    ruleId: 0,
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "doc",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "docx",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "odt",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "txt",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "rtf",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "pages",
      },
    ],
  },
  action: {
    type: "move",
    value: "DOCUMENTOS",
    ruleId: 0,
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "xls",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "xlsx",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "ods",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "csv",
      },
    ],
  },
  action: {
    type: "move",
    value: "PLANILHAS",
    ruleId: 0,
  },
};

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
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "ppt",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "pptx",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "odp",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "key",
      },
    ],
  },
  action: {
    type: "move",
    value: "APRESENTAÇÕES",
    ruleId: 0,
  },
};

// 10. Regra para Executáveis
export const ruleSeed_executaveis: NewFullRulePayload = {
  rule: {
    name: "Organizar Executáveis e Instaladores",
    description: "Move executáveis e instaladores (exe, msi, dmg, etc.) para a pasta 'EXECUTÁVEIS'.",
    isSystem: true,
    isActive: true, // Sugiro que talvez esta seja `false` por padrão ou tenha um aviso para o usuário
  },
  conditionsTree: {
    id: generateConditionId(),
    type: "group",
    operator: "OR",
    children: [
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "exe",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "msi",
      },
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "dmg",
      }, // macOS
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "app",
      }, // macOS (bundles)
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "deb",
      }, // Linux
      {
        id: generateConditionId(),
        type: "condition",
        field: "fileExtension",
        operator: "equals",
        value: "rpm",
      }, // Linux
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
