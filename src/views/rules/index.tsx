import GenericTabs from "../../components/GenericTabs";
import PageWrapper from "../../components/PageWrapper";
import Rule from "../../components/Rule";

const Rules = () => {
  return (
    <PageWrapper
      title="Regras de Organização"
      action="btn"
      btn={{
        style: "contained",
        Action: () => {
          console.log("aaaa");
        },
        text: "Adicionar Regra",
      }}
    >
      <GenericTabs
        tabNames={["Todas", "Ativas", "Sistema", "Personalizadas"]}
        tabContents={[
          <Rule
            title="Fotos por data"
            extension={["PDF", "TIFF", "JPG"]}
            description="Organiza fotos em pastas por ano/mês (ex: Imagens/2024/03-Março)"
          />,
          <Rule
            title="Sistema"
            extension={["PDF", "TIFF", "JPG"]}
            description="Organiza fotos em pastas por ano/mês (ex: Imagens/2024/03-Março)"
          />,
        ]}
      />
    </PageWrapper>
  );
};

export default Rules;
