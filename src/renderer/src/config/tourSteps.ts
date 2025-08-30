// Em: src/config/tourSteps.ts

import { StepOptions } from "shepherd.js";
import { tourButtons } from "./tourButtons";

export interface CustomizedStepOptions extends StepOptions {
  page?: string;
}
// Passos para o tutorial simples, que ocorre na HomePage
export const simpleTourSteps: CustomizedStepOptions[] = [
  // Step 1: Intro
  {
    id: "intro",
    title: "Tutorial Rápido",
    text: "Este tutorial será dividido em duas partes: Organização rápida e organização avançada. Clique em 'Próximo' para começar.",
    attachTo: { element: "#how-to-use-card", on: "bottom-end" },
    buttons: [tourButtons.next],
  },
  // Step 2: Apresenta o Dropzone
  {
    id: "drop-zone-intro",
    title: "Seletor de Pastas",
    text: "Aqui você pode adicionar pastas clicando no campo ou arrastando-as para serem organizadas.",
    attachTo: { element: "#folder-drop-zone", on: "top" },
  },
  // Step 3: Vídeo
  {
    // id: "video-demo",
    title: "Seletor de Pastas",
    text: `
      <div style="text-align: center;">
        <p>Assista o vídeo abaixo.</p>
        <video width="100%" controls autoPlay style="border-radius: 8px;">
          <source src="/videos/tutorial.mp4" type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    `,
    attachTo: { element: "#folder-drop-zone", on: "top" },
    buttons: [tourButtons.back, tourButtons.next],
  },
  // Step 4: Interativo - Clicar no Dropzone
  {
    id: "click-drop-zone",
    title: "Sua Vez!",
    text: "Agora, clique no campo para abrir o seletor de pastas do seu sistema.",
    attachTo: { element: "#folder-drop-zone", on: "top" },
    canClickTarget: true,
    buttons: [],
  },

  // Step 5: Apresenta o Diálogo de Confirmação

  {
    id: "confirm-dialog-content-text",
    title: "Confirmação de Ação",
    text: "Aqui serão listadas as pastas selecionadas.",
    attachTo: { element: "#confirm-dialog-content-text", on: "top" },
  },
  // Step 6: Apresenta o Diálogo de Confirmação
  {
    id: "confirm-dialog-actions",
    title: "Confirmação de Ação",
    text: "Aqui você selecionará o tipo de organização que deseja aplicar às pastas selecionadas.",
    attachTo: { element: "#confirm-dialog-actions", on: "top" },
  },
  // Step 7: Interativo - Clicar no Botão de Perfil Padrão
  {
    id: "click-default-profile",
    title: "Organizar com Perfil Padrão",
    text: "Clique aqui para organizar as pastas usando o perfil padrão.",
    attachTo: { element: "#btn-default", on: "top" },
    canClickTarget: true,
    buttons: [],
  },
  // Step 8: Apresenta a Atividade Recente
  {
    id: "recent-activity-intro",
    title: "Registro de Logs",
    text: "Aqui você verá todas as ações que foram executadas.",
    attachTo: { element: "#recent-activity", on: "top" },
  },
  // Step 9: Interativo - Clicar em um item de log
  {
    id: "recent-activity-list",
    title: "Registro de Logs",
    text: "Clique em um dos logs para ver as informações detalhadas.",
    attachTo: { element: "#recent-activity-list", on: "top" },
    buttons: [],
    canClickTarget: true,
  },
  // Step 10: Apresenta o popup de detalhes
  {
    id: "details-items",
    title: "Informações Detalhadas",
    text: "Aqui você pode ver todas as informações detalhadas da ação efetuada.",
    attachTo: { element: "#details-items", on: "top" },
  },

  // Step 11: Apresenta o campo de busca do popup de detalhes
  {
    id: "details-search",
    title: "Informações Detalhadas",
    text: "Aqui você pode pesquisar nas informações abaixo.",
    attachTo: { element: "#details-search", on: "top" },
    classes: "tour-step-wide",
  },

  {
    id: "close-organization-log",
    title: "Encerramento",
    text: "Clique neste botão para fechar o modal",
    attachTo: { element: "#close-organization-log", on: "top" },
    buttons: [tourButtons.back],
    canClickTarget: true,
  },

  {
    id: "simple-tour-complete",
    title: "Tutorial Básico Concluído",
    text: "Parabéns! 🎉🎉 <br />Você finalizou o tutorial básico! <br />Escolha uma das opções para prosseguir:",
    attachTo: { element: "#how-to-use-card", on: "top" },
    buttons: [tourButtons.complete, tourButtons.nextTour],
  },
];

// Placeholder para seu futuro tutorial avançado
export const advancedTourSteps: CustomizedStepOptions[] = [
  {
    id: "start-advanced",
    title: "Tutorial Avançado",
    text: `Como vimos em passos anteriores, é possível selecionar perfis e regras. 
          <br /> Vamos navegar sobre cada menu e detalhá-los`,
    buttons: [tourButtons.next],
  },
  {
    id: "sidebar-menu",
    title: "Tutorial Avançado",
    text: `Passe o mouse sobre a barra lateral para expandir o menu.`,
    attachTo: { element: ".sidebar-home", on: "right" },
    canClickTarget: true,
    buttons: [tourButtons.next],
  },
];
