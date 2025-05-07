import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import MenuButtonType from "../../types/MenuButtonType";
import { Link } from "react-router-dom";

const MenuButton = ({ text, children, to }: MenuButtonType) => {
  return (
    <ListItemButton component={Link} to={to || "#"}>
      <ListItemIcon>{children}</ListItemIcon>
      <ListItemText className="menu-item-text" primary={text} />
    </ListItemButton>
  );
};

export default MenuButton;
