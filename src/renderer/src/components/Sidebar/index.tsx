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
import { useTourStore } from "../../store/tourStore";

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

const SidebarButton = ({
  text,
  children,
  to,
  ...rest
}: { text: string; children: React.ReactNode; to: string } & React.HtmlHTMLAttributes<HTMLElement>) => {
  const location = useLocation();
  const isActive = location.pathname.replaceAll("/", "") === to;
  return (
    <ListItemButton component={Link} to={to || "#"} selected={isActive} {...rest}>
      <ListItemIcon>{children}</ListItemIcon>
      <StyledListItemText primary={text} />
    </ListItemButton>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const tourNext = useTourStore((state) => state.tourNext);
  const isTourActive = useTourStore((state) => state.isTourActive);
  const getCurrentStepId = useTourStore((state) => state.getCurrentStepId);
  const SidebarSection = styled(Box)(({ theme }) => ({
    marginTop: isOpen ? theme.spacing(5) : undefined,
  }));

  const handleTransitionEnd = () => {
    if (isOpen && isTourActive() && getCurrentStepId() === "sidebar-menu") {
      tourNext();
    }
  };

  const widthMenu = isOpen ? "245px" : "75px";
  return (
    <>
      <Drawer
        className="sidebar-home"
        open
        variant="permanent"
        sx={{
          width: widthMenu,
          transition: "width 0.4s",
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
        onMouseLeave={() => {
          if (!isTourActive()) {
            setIsOpen(false);
          }
        }}
        onTransitionEnd={handleTransitionEnd}
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
            <SidebarButton id="home" text="Início" to="/">
              <Icon icon="fluent-color:home-16" width="30" height="30" />
            </SidebarButton>

            <SidebarButton id="rules" text="Regras" to="rules">
              <Icon icon="gala:settings" width="30" height="30" color="#00ceff" />
            </SidebarButton>

            <SidebarButton id="profiles" text="Perfis" to="profiles">
              <Icon icon="fluent-color:person-add-24" width="30" height="30" />
            </SidebarButton>
            <SidebarButton id="folders" text="Pastas" to="folders">
              <Icon icon="fluent-emoji:file-folder" width="30" height="30" />
            </SidebarButton>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle sx={{ display: isOpen ? "block" : "none" }} variant="h6">
              Ferramentas
            </SidebarTitle>
            <SidebarButton id="report" text="Relatórios" to="report">
              <Icon icon="nimbus:stats" width="30" height="30" color="#e52e2e" />
            </SidebarButton>
          </SidebarSection>
          <SidebarSection>
            <SidebarTitle sx={{ display: isOpen ? "block" : "none" }} variant="h6">
              Configurações
            </SidebarTitle>
            <SidebarButton id="settings" text="Configurações" to="settings">
              <Icon icon="flat-color-icons:settings" width="30" height="30" />
            </SidebarButton>

            <SidebarButton id="about" text="Sobre" to="about">
              <Icon icon="flat-color-icons:about" width="30" height="30" />
            </SidebarButton>

            <SidebarButton id="help" text="Ajuda" to="help">
              <Icon icon="noto:sos-button" width="30" height="30" />
            </SidebarButton>
          </SidebarSection>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
