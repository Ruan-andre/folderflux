// Em: src/main/services/ttsService.ts

import { app } from "electron";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";

const phoneticReplacements: { [key: string]: string } = {
  FolderFlux: "Fôlder Flãcs",
  Esta: "Ésta",
  Log: "Ló-gui",
  UMA: "umma",
  Card: "Cárdi",
};

function applyPhoneticReplacements(text: string): string {
  let processedText = text;
  for (const word in phoneticReplacements) {
    // Usamos uma RegEx para substituir a palavra inteira, ignorando maiúsculas/minúsculas
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    processedText = processedText.replace(regex, phoneticReplacements[word]);
  }
  return processedText;
}

function sanitizeText(text: string): string {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

  let sanitized = text;
  sanitized = sanitized.replace(emojiRegex, ""); // Remove emojis
  sanitized = sanitized.replace(/[*#`_~]/g, ""); // Remove caracteres de formatação (Markdown, etc.)
  sanitized = sanitized.replace(/\s+/g, " "); // Substitui múltiplos espaços por um só

  return sanitized.trim();
}

export function textToSpeech(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const resourcesPath = app.isPackaged ? process.resourcesPath : path.join(app.getAppPath(), "resources");

    const piperDir = path.join(resourcesPath, "piper");
    const piperExePath = path.join(piperDir, "piper.exe");
    const modelPath = path.join(resourcesPath, "tts-model", "pt_BR-faber-medium.onnx");
    const outputPath = path.join(app.getPath("temp"), `folderflux-speech-${Date.now()}.wav`);

    if (!fs.existsSync(piperExePath)) {
      return reject(new Error(`Executável do Piper não encontrado em: ${piperExePath}`));
    }
    if (!fs.existsSync(modelPath)) {
      return reject(new Error(`Modelo de voz não encontrado em: ${modelPath}`));
    }

    const args = ["--model", modelPath, "--output_file", outputPath];

    const piperProcess = execFile(
      piperExePath,
      args,
      // A MÁGICA ACONTECE AQUI: Definimos o CWD
      { cwd: piperDir },
      async (error, stdout, stderr) => {
        if (error) {
          console.error("Erro ao executar o Piper:", stderr);
          return reject(error);
        }
        try {
          // Após gerar o arquivo, leia-o como um Buffer
          const audioBuffer = await fs.promises.readFile(outputPath);
          // Opcional: delete o arquivo temporário depois de ler
          await fs.promises.unlink(outputPath);
          // Resolva a Promise com os dados brutos
          resolve(audioBuffer);
        } catch (readError) {
          reject(readError);
        }
      }
    );

    if (piperProcess.stdin) {
      const sanitizedText = sanitizeText(text);
      const processedText = applyPhoneticReplacements(sanitizedText);
      piperProcess.stdin.write(processedText);
      piperProcess.stdin.end();
    }
  });
}
