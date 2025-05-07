import Icon from "../../assets/icons";
import ContentWrapper from "../../components/ContentWrapper";
import { Box, Divider, Stack, Typography, Link } from "@mui/material";

const openExternal = (url: string) => {
  window.open(url, "_blank");
};

const AboutPage = () => {
  return (
    <ContentWrapper title="Sobre" gap="3.5rem" justifyContent="none" padding="3rem">
      <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
        <img src="src/assets/img/logo-ar-solutions.png" alt="Logo A/R Solutions" height="150" />
        <img src="src/assets/img/logo.svg" alt="Logo TidyFlux" height="150" />
      </Stack>

      <Box>
        <Typography variant="h4" gutterBottom>
          Sobre o Projeto
        </Typography>
        <Typography fontSize={15} color="text.secondary">
          TidyFlux é um software de organização automática de arquivos, desenvolvido pela empresa A/R
          SOLUTIONS. Seu objetivo é oferecer praticidade, automação e controle total sobre documentos e
          pastas, através de uma interface moderna, intuitiva e altamente configurável. O TidyFlux foi
          projetado para atender tanto usuários domésticos quanto profissionais, permitindo a criação de
          regras personalizadas para a organização eficiente dos arquivos.
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h4" gutterBottom>
          Sobre a A/R SOLUTIONS
        </Typography>
        <Typography fontSize={15} color="text.secondary">
          A/R SOLUTIONS é uma empresa focada no desenvolvimento de soluções digitais práticas, acessíveis e de
          alta qualidade. Com compromisso em inovação e atenção aos detalhes, buscamos transformar
          necessidades do dia a dia em experiências simples e eficientes através da tecnologia.
        </Typography>
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
          {/* <Link href="#" target="_blank" underline="hover" display="flex" alignItems="center" gap={1}>
            <Icon icon="mdi:web" color="#2196F3" width="32" height="32" />
            Página Oficial do Projeto
          </Link> */}
        </Stack>
      </Box>

      <Divider />

      {/* Rodapé de direitos autorais */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} A/R SOLUTIONS. Todos os direitos reservados.
        </Typography>
      </Box>
    </ContentWrapper>
  );
};

export default AboutPage;
