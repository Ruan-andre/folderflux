import { Box, styled, useTheme } from "@mui/material";
import Icon from "../../assets/icons";
import ContentWrapper from "../../components/ContentWrapper";
import GenericCard from "../../components/GenericCard";

const HelpPage = () => {
  const theme = useTheme();
  const HelpPageCard = styled(GenericCard)(() => ({
    width: "32rem",
    height: "11rem",
    backgroundColor: theme.palette.mode === "dark" ? "#1e2533" : "#e6e6e6ff",
    borderRadius: 8,
  }));
  return (
    <ContentWrapper sx={{ minHeight: "50vh" }} title="Ajuda">
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <HelpPageCard
          sx={{ width: "33rem", height: "11rem" }}
          title="Como usar?"
          subtitle="Guia rápido de início"
          icon={<Icon icon="fluent-emoji-flat:graduation-cap" width="45" height="45" />}
          iconColor="info"
        />
        <HelpPageCard
          onClick={() => {
            window.open("mailto:ruan.fullstack@gmail.com");
          }}
          title="Entrar em contato"
          subtitle="ruan.fullstack@gmail.com"
          icon={<Icon icon="logos:google-gmail" width="32" height="32" />}
          iconSx={{ backgroundColor: "#ffffff" }}
        />

        <HelpPageCard
          title="Reportar um bug"
          subtitle="Clique para reportar um bug"
          icon={<Icon icon="fluent-color:warning-16" width="45" height="45" />}
          onClick={() => {
            window.open("https://github.com/Ruan-andre/FolderFlux/issues");
          }}
        />
      </Box>
    </ContentWrapper>
  );
};

export default HelpPage;
