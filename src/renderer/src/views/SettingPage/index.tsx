import ContentWrapper from "../../components/ContentWrapper";
import GenericListItems from "../../components/GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";
import CustomSwitch from "../../components/CustomSwitch";
const listaConfigGeralMock: GenericListItemsType[] = [
  {
    title: "Iniciar com o sistema",
    subtitle: "Executar o TidyFlux quando computador for ligado",
    iconsAction: [<CustomSwitch />],
  },
  {
    title: "Monitoramento em tempo real",
    subtitle: "Organizar arquivos automaticamente quando detectar mudanças",
    iconsAction: [<CustomSwitch />],
  },
  {
    title: "Notificações",
    subtitle: "Exibir notificações quando arquivos forem organizados",
    iconsAction: [<CustomSwitch />],
  },
];

const listaConfigAparenciaMock: GenericListItemsType[] = [
  {
    title: "Tema escuro",
    subtitle: "Se ativado, o sistema ficará no modo escuro, do contrário, ficará com o tema claro.",
    iconsAction: [<CustomSwitch checked />],
  },
];
const SettingPage = () => {
  return (
    <ContentWrapper title="Configurações">
      <ContentWrapper title="Geral" hr boxShadow="none" titleSize={20} gap="1rem" padding="1rem">
        <GenericListItems
          list={listaConfigGeralMock}
          isButton={false}
          borderBottom="1px solid rgba(245, 245, 245, 0.27)"
          listItemPadding="1.5rem"
        />
      </ContentWrapper>

      <ContentWrapper title="Aparência" hr boxShadow="none" titleSize={20} gap="1rem" padding="1rem">
        <GenericListItems
          list={listaConfigAparenciaMock}
          isButton={false}
          borderBottom="1px solid rgba(245, 245, 245, 0.27)"
          listItemPadding="1.5rem"
        />
      </ContentWrapper>
    </ContentWrapper>
  );
};

export default SettingPage;
