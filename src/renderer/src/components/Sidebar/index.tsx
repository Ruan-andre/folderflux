import {
  Drawer,
  List,
  Box,
  Typography,
  styled,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  keyframes,
  Divider,
} from "@mui/material";
import Icon from "../../assets/icons";
import logo from "../../assets/img/logo.svg";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTourStore } from "../../store/tourStore";
import { useUpdateStore } from "../../store/updateStore";
import { useSidebarStore } from "../../store/sidebarStore";

const sidebarSections = [
  {
    title: "Organização",
    items: [
      { id: "home", text: "Início", to: "/", iconName: "fluent-color:home-16" },
      { id: "rules", text: "Regras", to: "rules", iconName: "gala:settings", iconColor: "#00ceff" },
      { id: "profiles", text: "Perfis", to: "profiles", iconName: "fluent-color:person-add-24" },
      { id: "folders", text: "Pastas", to: "folders", iconName: "fluent-emoji:file-folder" },
    ],
  },
  {
    title: "Ferramentas",
    items: [
      { id: "report", text: "Relatórios", to: "report", iconName: "nimbus:stats", iconColor: "#e52e2e" },
    ],
  },
  {
    title: "Configurações",
    items: [
      { id: "settings", text: "Configurações", to: "settings", iconName: "flat-color-icons:settings" },
      { id: "about", text: "Sobre", to: "about", iconName: "flat-color-icons:about" },
      { id: "help", text: "Ajuda", to: "help", iconName: "noto:sos-button" },
    ],
  },
];

const SidebarTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.4rem",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
  fontWeight: 600,
  paddingLeft: theme.spacing(2),
}));

const StyledListItemText = styled(ListItemText)({
  "& .MuiListItemText-primary": {
    fontSize: "1.8rem",
  },
});

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
  }
`;

const UpdateButton = styled(ListItemButton)(({ theme }) => ({
  marginTop: "auto",
  backgroundColor: "#2ecc71",
  color: "white",
  "&:hover": {
    backgroundColor: "#27ae60",
  },
  animation: `${pulseAnimation} 2s infinite`,
  borderRadius: theme.shape.borderRadius,
}));

interface SidebarButtonProps {
  id: string;
  text: string;
  to: string;
  iconName: string;
  iconColor?: string;
}

const SidebarButton = ({ id, text, to, iconName, iconColor }: SidebarButtonProps) => {
  const location = useLocation();
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.includes(to);

  return (
    <ListItemButton component={Link} to={to} selected={isActive} id={id}>
      <ListItemIcon>
        <Icon icon={iconName} width="30" height="30" color={iconColor} />
      </ListItemIcon>
      <StyledListItemText primary={text} />
    </ListItemButton>
  );
};

const Sidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setIsOpen = useSidebarStore((state) => state.setIsOpen);
  const { tourNext, isTourActive, getCurrentStepId } = useTourStore();
  const isUpdateAvailable = useUpdateStore((state) => state.isUpdateAvailable);

  const handleTransitionEnd = () => {
    if (isOpen && isTourActive() && getCurrentStepId() === "sidebar-menu") {
      tourNext();
    }
  };

  const widthMenu = isOpen ? "245px" : "80px";

  return (
    <Drawer
      className="sidebar"
      variant="permanent"
      sx={{
        width: widthMenu,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: widthMenu,
          overflowX: "hidden",
          padding: "10px",
          transition: "width 0.1s ease-in-out",
          display: "flex",
          flexDirection: "column",
        },
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => !isTourActive() && setIsOpen(false)}
      onTransitionEnd={handleTransitionEnd}
    >
      <Box
        component="img"
        src={logo}
        alt="Logo"
        sx={{
          objectFit: "contain",
          maxHeight: isOpen ? 150 : 0,
          minHeight: 0,
          opacity: isOpen ? 1 : 0,
          transition: "max-height 0.4s ease-in-out, opacity 0.2s ease-in-out",
          mb: isOpen ? 2 : 0,
        }}
      />

      <List sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {sidebarSections.map((section, index) => (
          <Fragment key={section.title}>
            {index > 0 && (
              <Divider
                sx={{
                  mt: isOpen ? 2 : 1,
                  mb: isOpen ? 2 : 1,
                  mx: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                }}
              />
            )}

            <SidebarTitle sx={{ opacity: isOpen ? 1 : 0, transition: "opacity 0.2s" }}>
              {section.title}
            </SidebarTitle>

            {section.items.map((item) => (
              <SidebarButton {...item} key={item.id} />
            ))}
          </Fragment>
        ))}

        {isUpdateAvailable && (
          <UpdateButton
            onClick={() => {
              window.api.ElectronUpdater.installUpdate();
            }}
          >
            <ListItemIcon>
              <Icon icon="line-md:downloading-loop" width="30" height="30" color="white" />
            </ListItemIcon>
            <StyledListItemText primary="Atualizar" />
          </UpdateButton>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
