import GenericCard from "../../components/GenericCard";
import Icon from "../../assets/icons/index";
import PageWrapper from "../../components/PageWrapper";
import FolderDropZone from "../../components/FolderDropZone";
import GenericListItems from "../../components/GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";

const Home = () => {
  const listaPastasMock: GenericListItemsType[] = [
    {
      title: "Pastas 1",
      subtitle: "Modificado em....",
      icon: <Icon icon="fluent-emoji-flat:file-folder" width="30" height="30" />,
      iconsAction: [
        <Icon icon="icon-park:edit-two" width="30" height="30" />,
        <Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />,
      ],
    },
    {
      title: "Pastas 1",
      subtitle: "Modificado em....",
      icon: <Icon icon="fluent-emoji-flat:file-folder" width="30" height="30" />,
      iconsAction: [
        <Icon icon="icon-park:edit-two" width="30" height="30" />,
        <Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />,
      ],
    },
  ];
  return (
    <PageWrapper minHeightStyle="100vh">
      <div className="flex-center">
        <GenericCard title="Organizar Agora" subtitle="Execute a organização imediata">
          <Icon icon="openmoji:broom" width="45" height="45" />
        </GenericCard>
        <GenericCard title="Como usar?" subtitle="Guia rápido de início">
          <Icon icon="fluent-emoji-flat:graduation-cap" width="45" height="45" />
        </GenericCard>
      </div>
      <FolderDropZone
        onDrop={(folder) => {
          console.log("Arquivos da pasta:", folder);
        }}
      />
      <PageWrapper
        title="Pastas Adicionadas"
        btnAction={() => {
          console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        }}
      >
        <GenericListItems list={listaPastasMock} />
      </PageWrapper>
    </PageWrapper>
  );
};

export default Home;
