import Icon from "../../assets/icons";
import ContentWrapper from "../../components/ContentWrapper";
import { Box, Divider, Stack, Typography, Link } from "@mui/material";
import logoImg from "../../assets/img/logo.svg";

const openExternal = (url: string) => {
  window.open(url, "_blank");
};

const AboutPage = () => {
  return (
    <ContentWrapper title="Sobre" sx={{ gap: "3.5rem", padding: "3rem" }}>
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <Box component={"img"} alt="FolderFlux Logo" src={logoImg} sx={{ height: 180 }} />
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
          <Typography fontSize={15}>
            Ele é um projeto de código aberto, mantido com muito esforço e dedicação nas minhas horas vagas.
          </Typography>
        </Box>
      </Box>

      <Divider />
      <Box>
        <Typography variant="h4" gutterBottom>
          Contato
        </Typography>
        <Stack spacing={2}>
          <Link
            onClick={() => openExternal("https://www.linkedin.com/in/andré-ruan-554854250")}
            underline="hover"
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            gap={1}
          >
            <Icon icon="mdi:linkedin" color="#0077B5" width="32" height="32" />
            LinkedIn
          </Link>

          <Link
            onClick={() => openExternal("https://a-ruan-portfolio.vercel.app/")}
            underline="hover"
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            gap={1}
          >
            <Icon icon="noto:briefcase" color="#4CAF50" width="32" height="32" />
            Portfólio
          </Link>
          <Link
            onClick={() => openExternal("https://folderflux.com/")}
            target="_blank"
            underline="hover"
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ cursor: "pointer" }}
          >
            <Icon icon="mdi:web" color="#2196F3" width="32" height="32" />
            Página Oficial do Projeto
          </Link>
        </Stack>
      </Box>

      <Divider />

      {/* Rodapé de direitos autorais */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} André Ruan. Lançado sob a Licença MIT.
        </Typography>
      </Box>
    </ContentWrapper>
  );
};

export default AboutPage;
