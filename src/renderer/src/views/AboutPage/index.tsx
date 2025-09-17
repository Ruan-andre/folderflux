import React, { useEffect, useState } from "react";
import Icon from "../../assets/icons";
import ContentWrapper from "../../components/ContentWrapper";
import {
  Box,
  Divider,
  Stack,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import logoImg from "../../assets/img/logo.svg";
import ChangelogModal from "../../components/ChangelogModal";
import styled from "@emotion/styled";

const openExternal = (url: string) => {
  window.open(url, "_blank");
};

const ListItemTextStyled = styled(ListItemText)({
  "& .MuiTypography-root": {
    fontSize: 17,
    fontWeight: 500,
  },
});

const AboutPage = () => {
  // Obtém a versão do app via preload (exposta pelo Electron)
  const [version, setVersion] = useState<string>("");
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);
  useEffect(() => {
    if (window.api?.app?.getVersion) {
      window.api.app.getVersion().then((v: string) => {
        if (typeof v === "string") setVersion(v);
      });
    }
  }, []);

  return (
    <ContentWrapper title="Sobre" sx={{ gap: "3.5rem", padding: "3rem" }}>
      <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
        <Box component={"img"} alt="FolderFlux Logo" src={logoImg} sx={{ height: 180 }} />
        {version && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Versão: {version}
            </Typography>
            <Button variant="text" size="small" sx={{ mt: 0.5 }} onClick={() => setIsChangelogOpen(true)}>
              Ver histórico de versões
            </Button>
          </>
        )}
      </Stack>

      <Box>
        <Typography variant="h4" gutterBottom>
          Sobre o Projeto
        </Typography>
        <Box color="text.secondary">
          <Typography fontSize={15}>
            Olá! Eu sou o André Ruan, o desenvolvedor por trás do FolderFlux.
          </Typography>
          <br />
          <Typography fontSize={15}>
            Criei o FolderFlux como um projeto pessoal para resolver um problema que eu mesmo tinha: a
            constante bagunça de arquivos no meu computador. O que começou como uma ferramenta para uso
            próprio evoluiu para este software completo, que agora compartilho com a comunidade.
          </Typography>
          <Typography fontSize={15}>
            Ele é um projeto de código aberto, mantido com muito esforço e dedicação nas minhas horas vagas.
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4" gutterBottom>
          Apoiando o Futuro do FolderFlux
        </Typography>
        <Box color="text.secondary">
          <Typography fontSize={15}>
            Se o FolderFlux te ajuda a ser mais organizado, considere apoiar o projeto. Sua contribuição ajuda
            a manter o desenvolvimento ativo e me permite dedicar mais tempo a novas funcionalidades e
            correções. Futuramente, planejo oferecer recursos premium para usuários avançados, um modelo que
            ajuda a garantir a longevidade do software.
          </Typography>
        </Box>
      </Box>

      <Divider />
      <Box>
        <Typography variant="h4" gutterBottom>
          Contato
        </Typography>
        <List sx={{ width: "100%", maxWidth: 560 }}>
          <ListItemButton onClick={() => openExternal("https://www.linkedin.com/in/andré-ruan-554854250")}>
            <ListItemIcon>
              <Icon icon="mdi:linkedin" color="#0077B5" width="28" height="28" />
            </ListItemIcon>
            <ListItemTextStyled primary="LinkedIn" />
          </ListItemButton>
          <ListItemButton onClick={() => openExternal("https://andreruan.dev/")}>
            <ListItemIcon>
              <Icon icon="noto:briefcase" color="#4CAF50" width="28" height="28" />
            </ListItemIcon>
            <ListItemTextStyled primary="Portfólio" />
          </ListItemButton>
          <ListItemButton onClick={() => openExternal("https://folderflux.com/")}>
            <ListItemIcon>
              <Icon icon="mdi:web" color="#2196F3" width="28" height="28" />
            </ListItemIcon>
            <ListItemTextStyled primary="Página Oficial do Projeto" />
          </ListItemButton>
        </List>
      </Box>

      <Divider />

      {/* Rodapé de direitos autorais */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} André Ruan. Lançado sob a Licença MIT.
        </Typography>
      </Box>
      <ChangelogModal open={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
    </ContentWrapper>
  );
};

export default AboutPage;
