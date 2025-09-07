
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAndClearAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      if (currentAudioRef.current.src && currentAudioRef.current.src.startsWith("blob:")) {
        URL.revokeObjectURL(currentAudioRef.current.src);
      }
      currentAudioRef.current = null;
    }
  };

  useEffect(() => {
    const cleanupPlay = window.api.onPlayAudio(async (_event, text) => {
      stopAndClearAudio();

      const response = await window.api.tts.generate(text);
      stopAndClearAudio();

      if (response.success && response.data) {
        const safeTypedArray = new Uint8Array(response.data);
        const blob = new Blob([safeTypedArray], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        const newAudio = new Audio(url);
        currentAudioRef.current = newAudio;

        newAudio.play().catch((e) => console.error("Erro ao tocar áudio gerado:", e));

        newAudio.onended = () => {
          // Apenas limpa, não precisa parar pois já terminou.
          if (currentAudioRef.current === newAudio) {
            URL.revokeObjectURL(url);
            currentAudioRef.current = null;
          }
        };
      }
    });

    // O 'stop' agora usa nossa função centralizada
    const cleanupStop = window.api.onStopAudio(() => {
      stopAndClearAudio();
    });

    // Garante a limpeza final quando o componente é desmontado
    return () => {
      cleanupPlay();
      cleanupStop();
      stopAndClearAudio();
    };
  }, []);

  return null;
};

export default AudioPlayer;
