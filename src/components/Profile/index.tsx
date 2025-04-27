import { Box, Button, Typography, useTheme } from "@mui/material";
import GenericCard from "../GenericCard";
import Icon from "../../assets/icons";

const Profile = () => {
  const theme = useTheme();
  return (
    <GenericCard
      displayCardStyle="flex"
      flexDirectionCard="column"
      gapCard="1rem"
      title="Trabalho"
      widthCard="340px"
      heightCard="235px"
      bgColor="#242A35"
      paddingCard={4}
      border="1px solid rgba(255, 255, 255, 0.1)"
      icon={<Icon icon="noto:briefcase" width="30" height="30" />}
      bgColorIcon="#273048"
    >
      <Box display={"flex"} flexDirection={"column"} gap={2}>
        <Typography variant="body2" fontSize="1.5rem" color="var(--title-gray-dark)">
          Perfil para organização de arquivos relacionados a trabalho
        </Typography>
        <Box display={"flex"} gap={2}>
          <div>
            <span style={{ color: theme.palette.primary.main, fontWeight: "bolder" }}>15 </span>regras
          </div>
          <div>
            <span style={{ color: theme.palette.primary.main, fontWeight: "bolder" }}> 15 </span>pastas
          </div>
          <div>
            <span style={{ color: theme.palette.primary.main, fontWeight: "bolder" }}> Ativo </span>
          </div>
        </Box>
        <Box display={"flex"} gap={1}>
          <Button
            variant="contained"
            sx={{ borderRadius: theme.shape.borderRadius, fontSize: theme.typography.subtitle2 }}
          >
            Ativar
          </Button>
          <Button
            variant="outlined"
            sx={{ borderRadius: theme.shape.borderRadius, fontSize: theme.typography.subtitle2 }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            sx={{ borderRadius: theme.shape.borderRadius, fontSize: theme.typography.subtitle2 }}
          >
            Duplicar
          </Button>
        </Box>
      </Box>
    </GenericCard>
  );
};

export default Profile;
