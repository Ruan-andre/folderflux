import {
  Drawer,
  List,
  Box,
  Typography,
  styled,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import Icon from "../../assets/icons";
import logo from "../../assets/img/logo.svg";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.4rem",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  fontWeight: 600,
}));

const StyledListItemText = styled(ListItemText)(() => ({
  "& .MuiListItemText-primary": {
    fontSize: "1.8rem",
  },
}));

const SidebarButton = ({ text, children, to }: { text: string; children: React.ReactNode; to: string }) => {
  const location = useLocation();
  const isActive = location.pathname.replaceAll("/", "") === to;
  return (
    <ListItemButton component={Link} to={to || "#"} selected={isActive}>
      <ListItemIcon>{children}</ListItemIcon>
      <StyledListItemText primary={text} />
    </ListItemButton>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const SidebarSection = styled(Box)(({ theme }) => ({
    marginTop: isOpen ? theme.spacing(5) : undefined,
  }));

  const widthMenu = isOpen ? "245px" : "75px";
  return (
    <>
      <Drawer
        open
        variant="permanent"
        sx={{
          width: widthMenu,
          transition: "0.4s",
          "& .MuiDrawer-paper": {
            width: widthMenu,
            overflowX: "hidden",
            backgroundColor: (theme) => theme.palette.background.paper,
            color: (theme) => theme.palette.text.primary,
            padding: "10px",
            transition: "0.4s",
          },
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Box
          component={"img"}
          src={logo}
          alt="Logo"
          sx={{ maxHeight: 150, objectFit: "contain" }}
          hidden={isOpen ? false : true}
        />
        <List>
          <SidebarSection>
            <SidebarTitle sx={{ display: isOpen ? "block" : "none" }} variant="h6">
              Organização
            </SidebarTitle>
            <SidebarButton text="Início" to="/">
              <Icon icon="fluent-color:home-16" width="30" height="30" />
            </SidebarButton>

            <SidebarButton text="Regras" to="rules">
              <Icon icon="gala:settings" width="30" height="30" color="#00ceff" />
            </SidebarButton>

            <SidebarButton text="Perfis" to="profiles">
              <Icon icon="fluent-color:person-add-24" width="30" height="30" />
            </SidebarButton>
            <SidebarButton text="Pastas" to="folders">
              <Icon icon="fluent-emoji:file-folder" width="30" height="30" />
            </SidebarButton>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle sx={{ display: isOpen ? "block" : "none" }} variant="h6">
              Ferramentas
            </SidebarTitle>
            <SidebarButton text="Relatórios" to="report">
              <Icon icon="nimbus:stats" width="30" height="30" color="#e52e2e" />
            </SidebarButton>
          </SidebarSection>
          <SidebarSection>
            <SidebarTitle sx={{ display: isOpen ? "block" : "none" }} variant="h6">
              Configurações
            </SidebarTitle>
            <SidebarButton text="Preferências" to="settings">
              <Icon icon="flat-color-icons:settings" width="30" height="30" />
            </SidebarButton>

            <SidebarButton text="Sobre" to="about">
              <Icon icon="flat-color-icons:about" width="30" height="30" />
            </SidebarButton>

            <SidebarButton text="Ajuda" to="help">
              <Icon icon="noto:sos-button" width="30" height="30" />
            </SidebarButton>
          </SidebarSection>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
