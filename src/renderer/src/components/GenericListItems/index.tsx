import {
  List,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
  Checkbox,
} from "@mui/material";
import GenericListItemsType from "../../types/GenericListItemsType";
import Icon from "../../assets/icons";
import CustomSwitch from "../CustomSwitch";

interface GenericListItemsProps {
  list: GenericListItemsType[] | undefined;
  mode?: "page" | "selection";
  btnEdit?: boolean;
  btnDelete?: boolean;
  btnSwitch?: boolean;
  isButton?: boolean;
  titleSize?: string;
  subtitleSize?: string;
  noGutters?: boolean;
  listItemPadding?: string;
  maxListHeight?: string;
  borderBottom?: string;
  selectedIds?: number[];
  onClickEdit?: (id: number) => void;
  onClickDelete?: (id: number) => void;
  onToggle?: (id: number) => void;
  onSelectionChange?: (id: number) => void;
}

const GenericListItems = ({
  list,
  mode = "page",
  isButton = true,
  titleSize,
  subtitleSize,
  noGutters,
  listItemPadding,
  maxListHeight,
  borderBottom,
  btnEdit,
  btnDelete,
  btnSwitch,
  selectedIds,
  onClickDelete,
  onClickEdit,
  onSelectionChange,
}: GenericListItemsProps) => {
  const theme = useTheme();

  if (!list || list.length === 0) return null;

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
            (btnEdit || btnDelete) && (
              <Box style={{ display: "flex", gap: "1rem" }}>
                {btnEdit && onClickEdit && (
                  <IconButton onClick={() => onClickEdit(item.id)}>
                    <Icon icon="icon-park:edit-two" width="30" height="30" />
                  </IconButton>
                )}
                {btnDelete && onClickDelete && (
                  <IconButton edge="end" onClick={() => onClickDelete(item.id)}>
                    <Icon icon="material-icon-theme:folder-trash-open" width="30" height="30" />
                  </IconButton>
                )}
              </Box>
            )
          }
        >
          {mode === "selection" && onSelectionChange && (
            <Checkbox
              checked={selectedIds?.some((x) => x === item.id)}
              onChange={() => onSelectionChange(item.id)}
            />
          )}
          {isButton ? (
            <ListItemButton sx={{ borderRadius: theme.shape.borderRadius }}>
              {item.icon && (
                <ListItemIcon>
                  <Icon icon={item.icon} width="30" height="30" />
                </ListItemIcon>
              )}

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
              {item.icon && (
                <ListItemIcon>
                  <Icon icon={item.icon} width="30" height="30" />
                </ListItemIcon>
              )}
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
          {btnSwitch && <CustomSwitch checked />}
        </ListItem>
      ))}
    </List>
  );
};

export default GenericListItems;
