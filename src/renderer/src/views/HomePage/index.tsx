import GenericCard from "../../components/GenericCard";
import Icon from "../../assets/icons/index";
import ContentWrapper from "../../components/ContentWrapper";
import FolderDropZone from "../../components/FolderDropZone";
import GenericListItems from "../../components/GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";

const HomePage = () => {
  const listaPastasMock: GenericListItemsType[] = [
    {
      id: 1,
      title: "Pastas 1",
      subtitle: "Modificado em....",
    },
    {
      id: 2,
      title: "Pastas 1",
      subtitle: "Modificado em....",
    },
  ];
  return (
    <ContentWrapper minHeightStyle="95vh">
      <div className="flex-center">
        <GenericCard
          title="Organizar Agora"
          subtitle="Execute a organização imediata"
          icon={<Icon icon="openmoji:broom" width="45" height="45" />}
          widthCard="33rem"
          heightCard="11rem"
        ></GenericCard>
        <GenericCard
          title="Como usar?"
          subtitle="Guia rápido de início"
          icon={<Icon icon="fluent-emoji-flat:graduation-cap" width="45" height="45" />}
          widthCard="33rem"
          heightCard="11rem"
        ></GenericCard>
      </div>
      <FolderDropZone
        onDrop={(folder) => {
          console.log("Arquivos da pasta:", folder);
        }}
      />

      <ContentWrapper title="Pastas Adicionadas">
        <GenericListItems list={listaPastasMock} />
      </ContentWrapper>
    </ContentWrapper>
  );
};

export default HomePage;
