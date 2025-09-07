import { ipcMain } from "electron";
import { textToSpeech } from "../../services/ttsService";

export function registerTtsHandlers() {
  ipcMain.handle("generate-tts", async (_event, text: string) => {
    try {
      const audioData = await textToSpeech(text);
      return { success: true, data: audioData };
    } catch (error) {
      console.error("Falha ao gerar áudio TTS:", error);
      return { success: false, error: (error as Error).message };
    }
  });
}
