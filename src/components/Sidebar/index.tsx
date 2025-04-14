import { Drawer, List } from "@mui/material";
import Icon from "../../assets/icons";
import MenuButton from "../MenuButton";
import "./sidebar.css";
import logo from "../../assets/img/logo.svg";
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
        <img
          src={logo}
          alt="Logo"
          style={{ maxHeight: 180, objectFit: "contain" }}
          hidden={isOpen ? false : true}
        />
        <List>
          <div className={isOpen ? "sidebar-section" : "closed"}>
            <h3 className="sidebar-title" hidden={isOpen ? false : true}>
              Organização
            </h3>
            <MenuButton text="Início" to="/">
              <Icon icon="fluent-color:home-16" width="30" height="30" />
            </MenuButton>

            <MenuButton text="Regras" to="rules">
              <Icon icon="gala:settings" width="30" height="30" color="#00ceff" />
            </MenuButton>

            <MenuButton text="Perfis">
              <Icon icon="fluent-color:person-add-24" width="30" height="30" />
            </MenuButton>
          </div>

          <div className={isOpen ? "sidebar-section" : "closed"}>
            <h3 className="sidebar-title" hidden={isOpen ? false : true}>
              Ferramentas
            </h3>
            <MenuButton text="Relatórios">
              <Icon icon="nimbus:stats" width="30" height="30" color="#e52e2e" />
            </MenuButton>
          </div>
          <div className={isOpen ? "sidebar-section" : "closed"}>
            <h3 className="sidebar-title" hidden={isOpen ? false : true}>
              Configurações
            </h3>
            <MenuButton text="Preferências">
              <Icon icon="flat-color-icons:settings" width="30" height="30" />
            </MenuButton>

            <MenuButton text="Sobre">
              <Icon icon="flat-color-icons:about" width="30" height="30" />
            </MenuButton>

            <MenuButton text="Ajuda">
              <Icon icon="noto:sos-button" width="30" height="30" />
            </MenuButton>
          </div>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
