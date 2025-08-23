import { NewSettings } from "../schema";

export const settingSeed: NewSettings[] = [
  {
    title: "Iniciar com o sistema",
    description: "Executar o FolderFlux quando computador for ligado",
    category: "general",
    isActive: true,
    type: "startWithOS",
  },
  {
    title: "Monitoramento em tempo real",
    description: "Organizar arquivos automaticamente quando detectar mudanças",
    category: "general",
    isActive: true,
    type: "realTime",
  },
  {
    title: "Notificações",
    description: "Exibir notificações quando arquivos forem organizados",
    category: "general",
    isActive: false, // por padrão false porque penso que como o app ficará rodando em segundo plano, pode haver uma chuva de notificações se ocorrer muitas organizações
    type: "notifications",
  },
  {
    title: "Tema escuro",
    description: "Se ativado, o sistema ficará no modo escuro, do contrário, ficará com o tema claro.",
    category: "appearance",
    isActive: true,
    type: "darkMode",
  },
];
