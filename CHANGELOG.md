# Changelog

## [1.9.1](https://github.com/Ruan-andre/folderflux/compare/v1.9.0...v1.9.1) (2026-08-18)


### Bug Fixes

* **build:** corrigir alias ~ no Vite para apontar para a raiz do projeto ([8266ad2](https://github.com/Ruan-andre/folderflux/commit/8266ad2464c19a7b6757eceb953b90a7160b018e))
* corrigir bug de timezone em creationDate/equals e deps ausentes no useMemo do ChangelogModal ([bd86844](https://github.com/Ruan-andre/folderflux/commit/bd86844770d348ce413caa6afef42210fe3f8150))

## [1.9.0](https://github.com/Ruan-andre/folderflux/compare/v1.8.1...v1.9.0) (2026-08-18)


### Features

* **rules:** suportar regras aplicadas a pastas ([75454ce](https://github.com/Ruan-andre/folderflux/commit/75454cee846dfa92e4f184680ee3407f31cd741e))


### Bug Fixes

* **fs:** propagar erros de filesystem em vez de engoli-los ([bfbdd0d](https://github.com/Ruan-andre/folderflux/commit/bfbdd0d40ec49fbe126a7c39f00fd0d7918f15fb))

## [1.8.1](https://github.com/Ruan-andre/folderflux/compare/v1.8.0...v1.8.1) (2026-07-03)


### Bug Fixes

* **update:** silenciar exibição/foco de janelas durante checagens em segundo plano ([740cb9e](https://github.com/Ruan-andre/folderflux/commit/740cb9e1f98aab266519df3bb9971e4f711ff655))

## [1.8.0](https://github.com/Ruan-andre/folderflux/compare/v1.7.0...v1.8.0) (2026-07-02)


### Features

* **update:** adicionar verificação periódica de atualizações em segundo plano a cada 1 hora ([42e16eb](https://github.com/Ruan-andre/folderflux/commit/42e16eb220a3ba350f2e392ee5dcf69c23326543))
* **update:** expor canal IPC check-for-updates para solicitação manual de atualização ([ba6f04f](https://github.com/Ruan-andre/folderflux/commit/ba6f04ffbf148ffa1ef67421c077667791fa9c5e))
* **update:** implementar botão reativo de download/instalação no histórico de versões ([0c92465](https://github.com/Ruan-andre/folderflux/commit/0c924658368ab125acda1f709774c392983d1285))

## [1.7.0](https://github.com/Ruan-andre/folderflux/compare/v1.6.2...v1.7.0) (2026-07-02)


### Features

* **deps:** adicionar dependência Recharts para visualizações de relatórios ([926ddbd](https://github.com/Ruan-andre/folderflux/commit/926ddbdcc98f43d468bbd743390f282e620c7c14))
* **report:** atualizar IPC e Preload para suportar logs paginados com filtros tipados ([13ff076](https://github.com/Ruan-andre/folderflux/commit/13ff0764a8e8860bfad4e9dec58484b9a68fbbd6))
* **report:** criar tipos e utilitários de data compartilhados para relatórios ([cf51ec6](https://github.com/Ruan-andre/folderflux/commit/cf51ec65c4520942c1b79509ed0d933bbc89beec))
* **report:** implementar tela de relatórios com paginação, filtros e checkboxes dinâmicos ([33038ec](https://github.com/Ruan-andre/folderflux/commit/33038ecab83dc7e4b67fd34f6b7cf2e90f4b481e))
* **report:** otimizar serviço de logs com filtragem nativa e utilitários compartilhados ([cc83bf8](https://github.com/Ruan-andre/folderflux/commit/cc83bf82b5f922befe4e15cdf0d9aad39162c86c))


### Bug Fixes

* adiciona paths-ignore no workflow de release para evitar execuções desnecessárias ([70cdaa1](https://github.com/Ruan-andre/folderflux/commit/70cdaa1808c42cb0d03d98ee37555da4846949eb))
* atualiza URL do vídeo para o portfolio ([e3a1e95](https://github.com/Ruan-andre/folderflux/commit/e3a1e957d4cf28695c9b6d093d968de103ccd5d5))

## [1.6.2](https://github.com/Ruan-andre/folderflux/compare/v1.6.1...v1.6.2) (2026-03-09)


### Bug Fixes

* ajusta a função getAllProfiles para aceitar parâmetro de atividade e modifica chamada em process ([a1ff60d](https://github.com/Ruan-andre/folderflux/commit/a1ff60d0bae6bbbb0f2222a1894717444bf2d665))
* corrige listener de atualização para evitar argumentos desnecessários ([a1ff60d](https://github.com/Ruan-andre/folderflux/commit/a1ff60d0bae6bbbb0f2222a1894717444bf2d665))

## [1.6.1](https://github.com/Ruan-andre/folderflux/compare/v1.6.0...v1.6.1) (2025-10-28)


### Bug Fixes

* substitui chamada direta para defaultOrganization por execução em worker para poder gerar registro de log ([a21c038](https://github.com/Ruan-andre/folderflux/commit/a21c0380eead8ac90b3610126aa2006e22d46560))

## [1.6.0](https://github.com/Ruan-andre/folderflux/compare/v1.5.0...v1.6.0) (2025-09-24)


### Features

* aprimora a lógica de seeds do banco de dados e atualiza regras de backup com novas condições ([309ab9c](https://github.com/Ruan-andre/folderflux/commit/309ab9c5061c130093c57169046acb9a0541e941))

## [1.5.0](https://github.com/Ruan-andre/folderflux/compare/v1.4.0...v1.5.0) (2025-09-18)


### Features

* adiciona suporte a ícones offline com geração automática de coleções mínimas ([791cd40](https://github.com/Ruan-andre/folderflux/commit/791cd40ce4431a462b158ca85302b600a57fcf1d))

## [1.4.0](https://github.com/Ruan-andre/folderflux/compare/v1.3.0...v1.4.0) (2025-09-17)


### Features

* adiciona hook para atalho de recarregar a aplicação com F5 ou Ctrl+R ([34f3ebf](https://github.com/Ruan-andre/folderflux/commit/34f3ebf1a4793239da9fc8e072491b3eeeb7a1ea))
* adiciona hook useReloadShortcut no componente App ([f234e5c](https://github.com/Ruan-andre/folderflux/commit/f234e5c6c471a8ab2855f16a0d3e7a14555388fa))
* adiciona modal de changelog para exibir histórico de versões ([b381433](https://github.com/Ruan-andre/folderflux/commit/b38143353fa8b200b9565bb4be10764f3cbc01cb))
* Adicionado coleção de ícones para uso offline. ([38ef7ee](https://github.com/Ruan-andre/folderflux/commit/38ef7ee1a6a22a83377cc5c8ac47fabf0bd4a7c0))
* registra coleções de ícones Iconify para uso offline ([cff802a](https://github.com/Ruan-andre/folderflux/commit/cff802a88774908a17a19d3d455eee7c44b6d07a))


### Bug Fixes

* ajusta o tempo de espera para exibir o passo do tour e navegação após a conclusão ([d2c5ac0](https://github.com/Ruan-andre/folderflux/commit/d2c5ac094ea38bb516a0beea2126731407a4cb94))
* corrige botões de navegação nos passos do tour para evitar que seja possível voltar/avançar em passos de transição de tela/componente ([228c7d8](https://github.com/Ruan-andre/folderflux/commit/228c7d8d477369b2b846d5a09df8565fd9c426b0))
* ignora arquivos e pastas protegidos em operações de monitoramento e manipulação de arquivos ([bbbf69b](https://github.com/Ruan-andre/folderflux/commit/bbbf69b5f43ac552ba5c2d5e1244b0b3247e3945))
* melhora a recuperação da janela principal após erro no autoUpdater e adiciona tratamento de falhas na verificação de atualizações ([3c4cf0d](https://github.com/Ruan-andre/folderflux/commit/3c4cf0dff7a508652930343bbb6762cac8f85b5f))

## [1.3.0](https://github.com/Ruan-andre/folderflux/compare/v1.2.1...v1.3.0) (2025-09-17)


### Features

* adiciona janela de atualização e lógica de verificação de atualizações ([4407e68](https://github.com/Ruan-andre/folderflux/commit/4407e682d0912cd4e50f8de23b161d37a3b8b3c6))
* adiciona método para obter a versão do app e exibe na página Sobre ([b088947](https://github.com/Ruan-andre/folderflux/commit/b088947d722169e5a83fcfe05a16459b896d27e7))
* adiciona opção de atualização automática nas configurações e lógica para verificar status da configuração ([cc6b588](https://github.com/Ruan-andre/folderflux/commit/cc6b5889712dd50c25fb259aed0c93ff933ab894))


### Bug Fixes

* corrige erros de digitação na política de uso e privacidade ([7853aaf](https://github.com/Ruan-andre/folderflux/commit/7853aaf27cf8bf821decc983e48f9175d03ec204))

## [1.2.1](https://github.com/Ruan-andre/folderflux/compare/v1.2.0...v1.2.1) (2025-09-16)


### Bug Fixes

* Corrige o registro de atalhos de teclado para recarregar a janela somente quando o FolderFlux estiver com a janela principal aberta ([e87ed7c](https://github.com/Ruan-andre/folderflux/commit/e87ed7cb5038971a3657f9b341ac37124546b9c3))

## [1.2.0](https://github.com/Ruan-andre/folderflux/compare/v1.1.0...v1.2.0) (2025-09-15)


### Features

* adiciona suporte a atalhos de teclado e manipulação de menu para versão empacotada ([449a6ae](https://github.com/Ruan-andre/folderflux/commit/449a6ae14990646bd00bf9519b5123337a857e0c))
* adiciona suporte para verificar se o aplicativo está empacotado e ajusta a navegação do tour ([ea0b803](https://github.com/Ruan-andre/folderflux/commit/ea0b803aeb62b3050c5dc73f966614bae4030e8e))


### Bug Fixes

* corrige o caminho de recursos para a versão empacotada ([30f7f37](https://github.com/Ruan-andre/folderflux/commit/30f7f37e13644a0c66fdd21f3138913ecaf364df))

## [1.1.0](https://github.com/Ruan-andre/folderflux/compare/v1.0.0...v1.1.0) (2025-09-13)


### Features

* Adição de um novo passo no tutorial para mostrar como utilizar a organização no menu de contexto do S.O ([114ca8a](https://github.com/Ruan-andre/folderflux/commit/114ca8a3d98faeff58d5a780b5cee1d5fd8124ff))
* Adição do release-please workflow e arquivos de configuração ([217776c](https://github.com/Ruan-andre/folderflux/commit/217776c52da809ba4b38e4b58054115530e6e403))


### Bug Fixes

* Alteração sugerida pelo github action de atualização do uses ([534bec0](https://github.com/Ruan-andre/folderflux/commit/534bec08de48ea326b14f7ef79172217e110c296))
* Correção de path dos arquivos de exemplo do tutorial em dev ([eb611b3](https://github.com/Ruan-andre/folderflux/commit/eb611b379a1bfc2d8e3c3b95eb78f5fa6f02a6d3))
* Correção do caminho dos arquivos de exemplo do tutorial ([5e58961](https://github.com/Ruan-andre/folderflux/commit/5e58961fa4fb62c8605a1a98abdbfbc252293174))
