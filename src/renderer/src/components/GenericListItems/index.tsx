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
  Typography,
} from "@mui/material";
import GenericListItemsType from "../../types/GenericListItemsType";
import Icon from "../../assets/icons";
import CustomSwitch from "../CustomSwitch";
import { formatSmartTime } from "../../functions/formatDate";
import { RefObject } from "react";
import LabelTextWithTooltip from "../LabelTextWithTooltip";

interface GenericListItemsProps {
  list: GenericListItemsType[] | undefined;
  id?: string;
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
  lastItemRef?: RefObject<HTMLLIElement>;
  onClickEdit?: (id: number) => void;
  onClickDelete?: (id: number) => void;
  onClickListItem?: (id: number) => void;
  onToggle?: (id: number) => void;
  onSelectionChange?: (id: number) => void;
}

const GenericListItems = ({
  list,
  id,
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
  lastItemRef,
  onClickListItem,
  onClickDelete,
  onClickEdit,
  onSelectionChange,
  onToggle,
}: GenericListItemsProps) => {
  const theme = useTheme();

  if (!list || list.length === 0) return null;

  function secondaryTextWithDate(item: GenericListItemsType) {
    return (
      <Box>
        <Typography variant="subtitle1">{item.subtitle}</Typography>
        <Typography variant="body1">{formatSmartTime(item.dateItem!)}</Typography>
      </Box>
    );
  }

  function textWithBreakLine(text: string | undefined) {
    if (!text) {
      return "";
    }
    return (
      <LabelTextWithTooltip text={text} typographySX={{ fontSize: "1.5rem", maxWidth: "40rem" }} breakLine />
    );
  }
  return (
    <List
      id={id}
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
          ref={index === list.length - 1 ? lastItemRef : null}
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
          {isButton && onClickListItem ? (
            <ListItemButton
              onClick={() => onClickListItem(item.id)}
              sx={{ borderRadius: theme.shape.borderRadius }}
            >
              {item.icon && (
                <ListItemIcon>
                  <Icon icon={item.icon} width="30" height="30" />
                </ListItemIcon>
              )}

              <ListItemText
                sx={{
                  alignItems: "flex-start",
                  "& .MuiListItemText-primary": {
                    fontSize: titleSize ?? theme.typography.caption,
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: subtitleSize ?? theme.typography.subtitle1,
                  },
                }}
                primary={item.title}
                slotProps={{
                  primary: { component: "div" },
                  secondary: { component: "div" },
                }}
                secondary={item.dateItem ? secondaryTextWithDate(item) : textWithBreakLine(item.subtitle)}
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
                slotProps={{ secondary: { component: "div" } }}
                secondary={item.dateItem ? secondaryTextWithDate(item) : textWithBreakLine(item.subtitle)}
              />
            </>
          )}
          {btnSwitch && onToggle && (
            <CustomSwitch
              onClick={() => {
                onToggle(item.id);
              }}
              checked={item.active}
            />
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default GenericListItems;
