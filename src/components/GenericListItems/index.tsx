import {
  List,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import GenericListItemsType from "../../types/GenericListItemsType";

const GenericListItems = ({ list }: { list: GenericListItemsType[] }) => {
  const theme = useTheme();

  if (list.length === 0) return;

  return (
    <List sx={{ width: "100%" }}>
      {list.map((item, index) => {
        return (
          <ListItemButton key={index} sx={{ borderRadius: theme.shape.borderRadius }}>
            <ListItem
              secondaryAction={
                <div style={{ display: "flex", gap: "1rem" }}>
                  {item.iconsAction?.map((item, index) => {
                    return (
                      <IconButton key={index} edge="end" aria-label="Editar">
                        {item}
                      </IconButton>
                    );
                  })}
                </div>
              }
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: theme.typography.caption,
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: theme.typography.subtitle1,
                  },
                }}
                primary={item.title}
                secondary={item.subtitle ? item.subtitle : ""}
              />
            </ListItem>
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default GenericListItems;
