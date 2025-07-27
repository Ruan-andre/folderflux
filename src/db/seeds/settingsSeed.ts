import { NewSettings } from "../schema";

export const settingSeed: NewSettings[] = [
  {
    title: "Iniciar com o sistema",
    description: "Executar o TidyFlux quando computador for ligado",
    category: "general",
    isActive: true,
  },
  {
    title: "Monitoramento em tempo real",
    description: "Organizar arquivos automaticamente quando detectar mudanças",
    category: "general",
    isActive: true,
  },
  {
    title: "Notificações",
    description: "Exibir notificações quando arquivos forem organizados",
    category: "general",
    isActive: true,
  },
  {
    title: "Tema escuro",
    description: "Se ativado, o sistema ficará no modo escuro, do contrário, ficará com o tema claro.",
    category: "appearance",
    isActive: true,
  },
];
