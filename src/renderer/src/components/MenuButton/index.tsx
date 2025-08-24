import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import MenuButtonType from "../../types/MenuButtonType";
import { Link, useLocation } from "react-router-dom";

const MenuButton = ({ text, children, to }: MenuButtonType) => {
  const location = useLocation();
  const isActive = location.pathname.replaceAll("/", "") === to;
  return (
    <ListItemButton component={Link} to={to || "#"} selected={isActive}>
      <ListItemIcon>{children}</ListItemIcon>
      <ListItemText className="menu-item-text" primary={text} />
    </ListItemButton>
  );
};

export default MenuButton;
