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
    text: 'Bem-vindo! Este guia rápido mostrará o fluxo principal de organização de pastas. Clique em "Próximo" para começar.',
    attachTo: { element: "#how-to-use-card", on: "bottom-end" },
    buttons: [tourButtons.next],
  },
  // Step 2: Apresenta o Dropzone
  {
    id: "drop-zone-intro",
    title: "Adicione Suas Pastas",
    text: "Comece por aqui. Neste campo, você poderá arrastar suas pastas, ou clicar para selecioná-las.",
    attachTo: { element: "#folder-drop-zone", on: "top" },
  },
  // Step 3: Vídeo
  {
    id: "video-demo",
    title: "Demonstração Rápida",
    text: `
      <div style="text-align: center;">
        <p>Clique no vídeo e veja como selecionar uma pasta e escolher uma opção.</p>
        <video width="100%" controls style="border-radius: 8px;">
          <source src="tutorial-media/video-tutorial-1.mp4" type="video/mp4" />
        </video>
      </div>
    `,
    // attachTo: { element: "#folder-drop-zone", on: "auto" },
    classes: "tour-step-extra-wide-video",
    buttons: [tourButtons.back, tourButtons.next],
  },
  // Step 4: Interativo - Clicar no Dropzone
  {
    id: "click-drop-zone",
    title: "Agora é sua vez!",
    text: "Clique na área indicada para abrir o seletor de pastas do seu sistema, e depois, clique em SELECIONAR PASTA.",
    attachTo: { element: "#folder-drop-zone", on: "top" },
    canClickTarget: true,
    buttons: [tourButtons.back],
  },
  // Step 5: Apresenta o Diálogo de Confirmação
  {
    id: "confirm-dialog-content-text",
    title: "Escolha uma Ação",
    text: "Excelente! Aqui você verá a lista de pastas que selecionou.",
    attachTo: { element: "#confirm-dialog-content-text", on: "top" },
    buttons: [tourButtons.next],
  },
  // Step 6: Apresenta o Diálogo de Confirmação
  {
    id: "confirm-dialog-actions",
    title: "Escolha uma Ação",
    text: "Aqui, você escolherá como deseja organizar os arquivos dessas pastas.",
    attachTo: { element: "#confirm-dialog-actions", on: "top" },
  },
  // Step 7: Interativo - Clicar no Botão de Perfil Padrão
  {
    id: "click-default-profile",
    title: "Organização Padrão",
    text: 'Para este tutorial, clique em "Usar Perfil Padrão" para executar a organização com regras pré-definidas.',
    attachTo: { element: "#btn-default", on: "top" },
    canClickTarget: true,
    buttons: [tourButtons.back],
  },
  // Step 8: Apresenta a Atividade Recente
  {
    id: "recent-activity-intro",
    title: "Ação Registrada",
    text: "Perfeito! Toda ação do FolderFlux é registrada aqui. Você pode ver um resumo do que aconteceu.",
    attachTo: { element: "#recent-activity", on: "top" },
    buttons: [tourButtons.next],
  },
  // Step 9: Interativo - Clicar em um item de log
  {
    id: "click-log-item",
    title: "Veja os Detalhes",
    text: "Quer saber exatamente quais arquivos foram organizados? Clique no log que acabamos de criar.",
    attachTo: { element: "#recent-activity-list", on: "top" },
    buttons: [tourButtons.back],
    canClickTarget: true,
  },
  // Step 10: Apresenta o popup de detalhes
  {
    id: "details-items",
    title: "Informações Detalhadas",
    text: "Nesta tela, veja os detalhes de cada arquivo.",
    attachTo: { element: "#details-items", on: "top" },
  },
  // Step 11: Apresenta o campo de busca do popup de detalhes
  {
    id: "details-search",
    title: "Pesquisa Rápida",
    text: "Se a lista for longa, use este campo para pesquisar um arquivo específico.",
    attachTo: { element: "#details-search", on: "top" },
  },
  {
    id: "close-organization-log",
    title: "Fechar Detalhes",
    text: "Quando terminar, clique no botão de fechar do modal para continuar.",
    attachTo: { element: "#close-organization-log", on: "top" },
    buttons: [tourButtons.back],
    canClickTarget: true,
  },

  {
    title: "Modo rápido",
    text: `<div style="text-align: center;">
              <p>Todos os passos que vimos anteriormente, podem ser executados em um único clique, usando o botão de organização rápida conforme o vídeo abaixo.</p>
              <video width="100%" autoplay loop controls style="border-radius: 8px;">
                <source src="tutorial-media/video-tutorial-2.mp4" type="video/mp4" />
              </video>
            </div>`,
    classes: "tour-step-extra-wide-video",
    buttons: [tourButtons.next],
  },

  {
    id: "simple-tour-complete",
    title: "Tutorial Básico Concluído",
    text: "Parabéns! 🎉 <br /> Você aprendeu o fluxo principal do FolderFlux! Agora você pode explorar o modo avançado ou finalizar o tutorial.",
    attachTo: { element: "#how-to-use-card", on: "top" },
    buttons: [tourButtons.complete, tourButtons.nextTour],
  },
];

export const advancedTourSteps: CustomizedStepOptions[] = [
  {
    id: "start-advanced",
    title: "Tutorial Avançado",
    text: `Agora que você dominou o básico, vamos explorar as ferramentas para criar suas próprias automações.`,
    buttons: [tourButtons.next],
  },
  {
    id: "sidebar-menu",
    title: "Menu de Navegação",
    text: `Passe o mouse sobre a barra de ícones à esquerda para expandir o menu principal.`,
    attachTo: { element: ".sidebar > div", on: "right" },
    buttons: [],
    canClickTarget: true,
  },

  {
    id: "sidebar-menu-rules",
    title: "Menu Regras",
    text: 'Aqui é onde você cria as "receitas" que o FolderFlux usará para identificar e organizar seus arquivos.',
    attachTo: { element: "#rules", on: "right" },
  },
  {
    id: "sidebar-menu-profiles",
    title: "Menu Perfis",
    text: 'Perfis agrupam suas regras e pastas. Pense neles como "projetos" de organização.',
    attachTo: { element: "#profiles", on: "right" },
  },

  {
    id: "sidebar-menu-folders",
    title: "Menu Pastas",
    text: "Aqui você gerencia o cadastro de pastas que podem ser vinculadas aos seus perfis.",
    attachTo: { element: "#folders", on: "right" },
  },

  // MENU DE RELATÓRIOS AINDA NÃO IMPLEMENTADO
  // {
  //  id: "sidebar-menu-report",
  //  title: "Menu Relatórios",
  //  text: "Neste menu veremos os relatórios detalhados de todas as ações efetuadas",
  //  attachTo: { element: "#report", on: "right" },
  //  buttons: [tourButtons.next],
  // },
  {
    id: "sidebar-menu-settings",
    title: "Menu Configurações",
    text: "Ajuste as preferências globais do programa, como tema, inicialização automática, etc.",
    attachTo: { element: "#settings", on: "right" },
  },
  {
    id: "sidebar-menu-about",
    title: "Menu Sobre",
    text: "Veja informações sobre o programa e links úteis.",
    attachTo: { element: "#about", on: "right" },
  },
  {
    id: "sidebar-menu-help",
    title: "Menu Ajuda",
    text: "Precisa de suporte ou quer reportar um problema? Acesse aqui.",
    attachTo: { element: "#help", on: "right" },
  },

  {
    id: "sidebar-menu-rules-click",
    title: "Vamos Criar uma Regra",
    text: 'Para continuar, clique no menu "Regras".',
    attachTo: { element: "#rules", on: "right" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    advanceOn: {
      event: "click",
      selector: "#rules",
    },
  },
  {
    id: "rule-tabs",
    page: "/rules",
    title: "Painel de Regras",
    text: "Este painel mostra todas as regras disponíveis, separadas entre as predefinidas e as que você criar.",
    attachTo: { element: "#rule-tabs", on: "bottom" },
  },
  {
    id: "rule-tabs-filter",
    title: "Filtros",
    text: "Use os filtros para visualizar rapidamente as regras por status: ativas ou inativas.",
    attachTo: { element: 'div[role="tablist"]', on: "bottom" },
  },

  {
    id: "rules-switch",
    title: "Ativar ou Desativar",
    text: "Use este interruptor para ligar ou desligar uma regra. Regras inativas são ignoradas durante a organização.",
    attachTo: { element: 'input[role="switch"]', on: "left" },
  },

  {
    id: "rules-add",
    title: "Adicionar Regras",
    text: "Aqui temos um botão para adicionar novas regras",
    attachTo: { element: "#btn-add-rule", on: "bottom" },
    buttons: [tourButtons.next],
    scrollTo: true,
  },

  {
    id: "add-rule-action",
    title: "Crie sua Primeira Regra",
    text: "Vamos criar uma regra customizada. Clique no botão de adicionar.",
    attachTo: { element: "#btn-add-rule", on: "bottom" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    scrollTo: true,
  },

  {
    id: "rule-form-intro",
    title: "Formulário de Regra",
    text: "Este é o formulário para criar ou editar uma regra.",
    attachTo: { element: "#rule-popup", on: "auto" },
    buttons: [tourButtons.next],
    classes: "tour-step-wide",
  },

  {
    id: "rule-form-name",
    title: "Nome da Regra",
    text: 'Dê um nome claro e descritivo para sua regra. Por exemplo: "Mover Faturas PDF".',
    attachTo: { element: "#ruleName", on: "bottom" },
    canClickTarget: true,
  },

  {
    id: "rule-form-description",
    title: "Descrição",
    text: "Este campo opcional ajuda a lembrar o que a regra faz.",
    attachTo: { element: "#ruleDescription", on: "bottom" },
    canClickTarget: true,
  },

  {
    id: "rule-form-conditions",
    title: "Condições",
    text: "Esta é a parte mais importante. As condições definem *quais* arquivos serão afetados pela regra.",
    attachTo: { element: "#conditionsGroup", on: "top" },
  },

  {
    id: "rule-form-root-operator",
    title: "Operador Lógico",
    text: 'Defina se o arquivo precisa atender a "TODAS" as condições ou apenas a "QUALQUER UMA" delas.',
    attachTo: { element: "#group-and-or-select", on: "bottom" },
  },
  {
    id: "rule-form-add-condition-action",
    title: "Adicionar Condição",
    text: "Clique aqui para adicionar sua primeira condição.",
    attachTo: { element: "#add-condition-root", on: "bottom" },
    buttons: [tourButtons.back],
    canClickTarget: true,
  },
  {
    id: "rule-form-condition-field",
    title: "Critério",
    text: "Escolha qual parte do arquivo você quer analisar: nome, extensão, tamanho, etc.",
    attachTo: { element: ".condition-field-select", on: "top" },
  },
  {
    id: "rule-form-condition-operator",
    title: "Operador",
    text: "Escolha como o critério será comparado, por exemplo, contém, não contém, é igual a, etc.",
    attachTo: { element: ".condition-operator-select", on: "top" },
  },
  {
    id: "rule-form-condition-value",
    title: "Valor",
    text: 'Digite o valor a ser comparado. Por exemplo, se o critério for "Extensão do arquivo" e o operador for "é igual a", você digitaria "pdf" aqui.',
    attachTo: { element: ".condition-value", on: "top" },
    canClickTarget: true,
  },
  {
    id: "rule-form-action",
    title: "Ação",
    text: 'Defina o que acontecerá com os arquivos que atenderem às condições. Por exemplo, "Mover para pasta".',
    attachTo: { element: "#inputOptions", on: "top" },
  },
  {
    id: "rule-form-destination",
    title: "Pasta de Destino",
    text: "Informe para onde o arquivo será movido. Você pode digitar um caminho ou apenas um nome de pasta, que será criada no local de origem.",
    attachTo: { element: "#folderSelectorInput", on: "top" },
    canClickTarget: true,
  },
  {
    id: "rule-form-browse",
    title: "Procurar Pasta",
    text: "Use este botão para abrir o seletor de pastas e escolher um destino.",
    attachTo: { element: "#folderSelectorButton", on: "top" },
  },
  {
    id: "rule-form-save-action",
    title: "Salvar Regra",
    text: 'Com tudo preenchido, clique em "Criar Regra" para salvar.',
    attachTo: { element: "#btn-confirm-rule", on: "top" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    scrollTo: true,
  },
  {
    id: "rule-form-new-rule-created",
    title: "Regra Criada!",
    text: "Excelente! Sua nova regra personalizada agora aparece na lista.",
    attachTo: { element: ".rule", on: "bottom" },
    buttons: [tourButtons.next],
  },
  {
    id: "rule-form-crud-buttons",
    title: "Ações Rápidas",
    text: "Use estes botões para editar, duplicar ou excluir uma regra rapidamente.",
    attachTo: { element: "#crud-buttons", on: "bottom" },
  },
  {
    id: "navigate-to-profiles",
    title: "Navegando para Perfis",
    text: 'Agora que criamos uma regra, vamos vinculá-la a um Perfil. Clique no menu "Perfis".',
    attachTo: { element: "#profiles", on: "right" },
    canClickTarget: true,
    buttons: [tourButtons.back],
    advanceOn: {
      event: "click",
      selector: "#profiles",
    },
  },
  {
    id: "profiles-page-intro",
    page: "/profiles",
    title: "Gerenciador de Perfis",
    text: "Este é um card de perfil. Vamos criar um novo para este tutorial.",
    attachTo: { element: ".profile-card", on: "bottom" },
  },

  {
    id: "add-profile-action",
    title: "Crie um Perfil",
    text: "Clique no botão para iniciar a criação do seu perfil customizado.",
    attachTo: { element: "#btn-add-profile", on: "bottom" },
    canClickTarget: true,
    buttons: [tourButtons.back],
  },
  {
    id: "profile-form-name",
    title: " Nome do Perfil",
    text: 'Dê um nome ao seu perfil. Exemplo: "Organizar Trabalho".',
    attachTo: { element: 'input[name="profileName"]', on: "bottom" },
    canClickTarget: true,
  },

  {
    id: "profile-form-description",
    title: "Descrição",
    text: "Adicione uma descrição opcional para lembrar o propósito deste perfil.",
    attachTo: { element: 'textarea[name="profileDescription"]', on: "bottom" },
    canClickTarget: true,
  },
  {
    id: "profile-form-icon",
    title: "Ícone",
    text: "Escolha um ícone para identificar seu perfil visualmente.",
    attachTo: { element: 'div[role="group"]', on: "bottom" },
    canClickTarget: true,
  },
  {
    id: "profile-form-folders-intro",
    title: "Pastas Monitoradas",
    text: "Agora, vamos definir quais pastas este perfil deve monitorar.",
    attachTo: { element: "#folder-management", on: "bottom" },
  },

  {
    id: "profile-form-manage-folders-action",
    title: "Gerenciar Pastas",
    text: "Clique aqui para abrir o gerenciador de pastas.",
    attachTo: { element: "#folder-management-button", on: "top" },
    canClickTarget: true,
    buttons: [tourButtons.back],
  },
  {
    id: "profile-form-add-folder-action",
    title: "Adicionar Pasta",
    text: "Clique para adicionar uma nova pasta e depois clique em SELECIONAR PASTA.",
    attachTo: { element: "#add-folder-button", on: "bottom" },
    canClickTarget: true,
    buttons: [],
  },
  {
    id: "profile-form-folder-added",
    title: "Pasta Adicionada",
    text: "A pasta que você selecionou agora está marcada e pronta para ser vinculada.",
    attachTo: { element: "li.list-item-folder:has(input:checked)", on: "bottom" },
    scrollTo: true,
  },
  {
    id: "profile-form-confirm-folders-action",
    title: "Confirmar Seleção",
    text: "Clique para confirmar as pastas selecionadas.",
    attachTo: { element: "#confirm-add-folder", on: "top" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    advanceOn: {
      event: "click",
      selector: "#confirm-add-folder",
    },
  },
  {
    id: "profile-form-folders-linked",
    title: "Pastas Vinculadas",
    text: "Ótimo! Agora este perfil sabe quais pastas monitorar.",
    attachTo: { element: "#folder-management", on: "top" },
  },
  {
    id: "profile-form-manage-rules-action",
    title: "Regras do Perfil",
    text: "Agora, vamos vincular a regra que criamos anteriormente a este perfil. Clique para gerenciar as regras.",
    attachTo: { element: "#rule-management-button", on: "top" },
    canClickTarget: true,
    buttons: [tourButtons.back],
  },
  {
    id: "profile-form-rules-list",
    title: "Vincular Regra",
    text: "Aqui está a lista de regras disponíveis. Vamos vincular a que criamos.",
    attachTo: { element: ".rule", on: "bottom" },
  },
  {
    id: "profile-form-check-rule-action",
    title: "Marcar Seleção",
    text: "Clique na caixa de seleção para vincular a regra ao perfil.",
    attachTo: { element: ".chk-rule", on: "right" },
    canClickTarget: true,
    buttons: [tourButtons.back],
    advanceOn: {
      event: "click",
      selector: ".chk-rule",
    },
  },
  {
    id: "profile-form-confirm-rules-action",
    title: "Confirmar Seleção",
    text: "Agora, confirme a seleção de regras.",
    attachTo: { element: "#confirm-add-rule", on: "top" },
    canClickTarget: true,
    buttons: [tourButtons.back],
    advanceOn: {
      event: "click",
      selector: "#confirm-add-rule",
    },
  },
  {
    id: "profile-form-save-action",
    title: "Finalizar",
    text: 'Com tudo configurado, clique em "Criar" para salvar seu novo perfil.',
    attachTo: { element: "#confirm-profile", on: "top" },
    canClickTarget: true,
    buttons: [tourButtons.back],
    scrollTo: true,
    advanceOn: {
      event: "click",
      selector: "#confirm-profile",
    },
  },
  {
    id: "profiles-page-final",
    title: "Perfil Criado!",
    text: "Seu novo perfil está pronto e ativo. O FolderFlux já está monitorando as pastas vinculadas a ele, aplicando as regras que você definiu.",
    attachTo: { element: "#profile-cards", on: "top" },
  },
  {
    id: "navigate-to-folders",
    title: "Menu Pastas",
    text: "Para finalizar, vamos dar uma olhada no menu de Pastas. Clique nele.",
    attachTo: { element: "#folders", on: "right" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    advanceOn: {
      event: "click",
      selector: "#folders",
    },
  },
  {
    id: "folders-page-intro",
    page: "/folders",
    title: "Gerenciador de Pastas",
    text: "Este painel centraliza todas as pastas que você já cadastrou. Já vimos seu funcionamento ao criar o perfil.",
    attachTo: { element: "#folder-management", on: "left" },
  },

  {
    id: "folders-page-intro",
    title: "Adicionar pastas",
    text: "Aqui podemos adicionar novas pastas.",
    attachTo: { element: "#add-folder-button", on: "left" },
  },
  {
    id: "folders-page-intro",
    title: "Adicionar pastas",
    text: "Neste botão, podemos editar as informações da pasta como o nome e o diretório.",
    attachTo: { element: ".btn-edit-item-list", on: "left" },
  },
  {
    id: "folders-page-intro",
    title: "Adicionar pastas",
    text: "Neste botão, podemos remover uma pasta, mas não se preocupe! Ela será removida somente do FolderFlux.",
    attachTo: { element: ".btn-delete-item-list", on: "left" },
  },

  // MENU RELATÓRIOS AINDA NÃO IMPLEMENTADO
  // {
  //  title: "Menu Relatórios",
  //  text: "Agora clique no menu RELATÓRIOS",
  //  attachTo: { element: "#report", on: "right" },
  //  buttons: [],
  //  canClickTarget: true,
  //  advanceOn: {
  //   event: "click",
  //   selector: "#report",
  //  },
  // },

  {
    id: "navigate-to-settings",
    title: "Menu Configurações",
    text: "Vamos para as Configurações.",
    attachTo: { element: "#settings", on: "right" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    advanceOn: {
      event: "click",
      selector: "#settings",
    },
  },

  {
    id: "settings-page-intro",
    page: "/settings",
    title: "Configurações Globais",
    text: "Nesta tela você gerencia as configurações gerais do aplicativo.",
    attachTo: { element: "main", on: "auto" },
    buttons: [tourButtons.next],
  },

  {
    title: "Inicialização com o Sistema",
    text: "Ao marcar esta opção, o FolderFlux iniciará automaticamente sempre que você ligar seu computador. Assim, suas pastas estarão sempre organizadas sem que você precise se preocupar em abrir o programa manualmente.",
    attachTo: { element: "#general-settings > ul > li:nth-child(1)", on: "bottom" },
    classes: "tour-step-wide",
  },
  {
    title: "Monitoramento em Tempo Real",
    text: "Habilitando esta função, o FolderFlux ficará de olho nas pastas que você adicionou aos perfis. Sempre que um novo arquivo chegar, ele será organizado imediatamente, sem que você precise fazer nada.",
    attachTo: { element: "#general-settings > ul > li:nth-child(2)", on: "bottom" },
    classes: "tour-step-wide",
  },

  {
    title: "Atualização Automática",
    text: "Ao habilitar esta opção, o FolderFlux aplicará automaticamente as atualizações mais recentes assim que você iniciar o programa.",
    attachTo: { element: "#general-settings > ul > li:nth-child(3)", on: "bottom" },
  },
  {
    title: "Tema do Aplicativo",
    text: "Aqui você pode escolher o visual do FolderFlux. Selecione entre o tema claro, escuro ou deixe que ele siga o tema do seu sistema operacional.",
    attachTo: { element: "#appearance-settings > ul > li:nth-child(1)", on: "bottom" },
  },
  {
    id: "help-menu-intro",
    title: "Precisa de Ajuda?",
    text: 'Se tiver qualquer dúvida ou problema, o menu "Ajuda" é o seu ponto de contato.',
    attachTo: { element: "#help", on: "right" },
  },

  {
    id: "navigate-to-home",
    title: "Tela inicial",
    text: "Vamos voltar para a tela inicial, clique no menu INÍCIO.",
    attachTo: { element: "#home", on: "right" },
    buttons: [tourButtons.back],
    canClickTarget: true,
    advanceOn: {
      event: "click",
      selector: "#home",
    },
  },

  {
    title: "Card Forçar Verificação",
    page: "/",
    text: `Agora com perfis, regras e pastas configurados,
     ao clicar neste card a organização será forçada a ser executada. Lembrando que não é necessário efetuar este procedimento sempre
     que desejar organizar os arquivos, pois o FolderFlux estará sempre observando as pastas adicionadas aos perfis para organizá-las. 🫡`,
    attachTo: { element: "#force-verification-card", on: "bottom" },
  },
  {
    title: "Card Forçar Verificação",
    text: `Este card mostrará o status dos perfis. Ao clicar nele, você será redirecionado para a página de perfis que vimos anteriormente.`,
    attachTo: { element: "#profile-status-card", on: "bottom" },
  },
  {
    title: "Card Forçar Verificação",
    text: `Ao clicar neste card você verá informações sobre como doar para ajudar o desenvolvimento do projeto.`,
    attachTo: { element: "#donation-card", on: "bottom" },
  },
  {
    id: "advanced-tour-complete",
    title: "Fim do Tutorial Avançado",
    text: "Parabéns! Você explorou todas as funcionalidades do FolderFlux. 🎉 <br/><br/> Agora você tem o poder de criar automações incríveis. Me sinto honrado em poder te ajudar!",
    buttons: [tourButtons.complete],
  },
];
