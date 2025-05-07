import {
  List,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
} from "@mui/material";
import GenericListItemsType from "../../types/GenericListItemsType";

interface GenericListItemsProps {
  list: GenericListItemsType[];
  isButton?: boolean;
  titleSize?: string;
  subtitleSize?: string;
  noGutters?: boolean;
  listItemPadding?: string;
  maxListHeight?: string;
  borderBottom?: string;
}

const GenericListItems = ({
  list,
  isButton = true,
  titleSize,
  subtitleSize,
  noGutters,
  listItemPadding,
  maxListHeight,
  borderBottom,
}: GenericListItemsProps) => {
  const theme = useTheme();

  if (list.length === 0) return null;

  return (
    <List
      sx={{
      
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: maxListHeight ?? "inherit",
      }}
    >
      {list.map((item, index) => (
        <ListItem
          key={index}
          sx={{
            padding: listItemPadding ?? 0,
            borderBottom: borderBottom ?? "none",
          }}
          disableGutters={noGutters ?? false}
          secondaryAction={
            item.iconsAction && (
              <Box style={{ display: "flex", gap: "1rem" }}>
                {item.iconsAction.map((icon, iconIndex) => (
                  <IconButton key={iconIndex} edge="end" aria-label="Ação">
                    {icon}
                  </IconButton>
                ))}
              </Box>
            )
          }
        >
          {isButton ? (
            <ListItemButton sx={{ borderRadius: theme.shape.borderRadius }}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: titleSize ?? theme.typography.caption,
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: subtitleSize ?? theme.typography.subtitle1,
                  },
                }}
                primary={item.title}
                secondary={item.subtitle || ""}
              />
            </ListItemButton>
          ) : (
            <>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: titleSize ?? theme.typography.caption,
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: subtitleSize ?? theme.typography.subtitle1,
                  },
                }}
                primary={item.title}
                secondary={item.subtitle || ""}
              />
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default GenericListItems;
