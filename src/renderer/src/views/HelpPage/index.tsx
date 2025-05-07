import { Box } from "@mui/material";
import Icon from "../../assets/icons";
import ContentWrapper from "../../components/ContentWrapper";
import GenericCard from "../../components/GenericCard";

const HelpPage = () => {
  return (
    <ContentWrapper title="Ajuda" minHeightStyle="50vh" justifyContent="none">
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <GenericCard
          title="Como usar?"
          subtitle="Guia rápido de início"
          icon={<Icon icon="fluent-emoji-flat:graduation-cap" width="45" height="45" />}
          widthCard="33rem"
          heightCard="11rem"
        />
        <GenericCard
          title="Entrar em contato"
          subtitle="ruan.fullstack@gmail.com"
          icon={<Icon icon="logos:google-gmail" width="32" height="32" />}
          bgColorIcon="#ffffff"
          widthCard="33rem"
          heightCard="11rem"
        />

        <GenericCard
          title="Reportar um bug"
          subtitle="Clique para reportar um bug"
          icon={<Icon icon="fluent-color:warning-16" width="45" height="45" />}
          widthCard="33rem"
          heightCard="11rem"
        />
      </Box>
    </ContentWrapper>
  );
};

export default HelpPage;
