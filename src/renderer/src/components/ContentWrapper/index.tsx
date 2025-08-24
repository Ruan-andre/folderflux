import {
  Box,
  Button,
  useTheme,
  Typography,
  Stack,
  AlertColor,
  styled,
  BoxProps,
  Divider,
} from "@mui/material";
import CustomSwitch from "../CustomSwitch";

type ContentWrapperProps = {
  children: React.ReactNode;
  id?: string;
  title?: string;
  titleTagType?: "h1" | "h2" | "h3" | "h4";
  switchBtn?: {
    Action?: () => void;
    value?: boolean;
  };
  commonBtn?: {
    Action?: () => void;
    style?: "outlined" | "contained" | "text";
    text?: string;
    color?: AlertColor;
  };
  hr?: boolean;
  sx?: BoxProps["sx"];
  className?: string;
};

const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "dark"
      ? theme.shadows[15]
      : "0 2px 8px 0 rgba(139, 133, 127, 0.15), 0 1px 3px 0 rgba(139, 133, 127, 0.1)",
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  overflow: "auto",
  scrollBehavior: "smooth",
  width: "100%",
  backgroundImage: "none",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  fontSize: "1rem",
  borderRadius: theme.shape.borderRadius,
}));

const ContentWrapper = ({
  children,
  id,
  title,
  titleTagType = "h2",
  switchBtn,
  commonBtn,
  hr,
  sx,
}: ContentWrapperProps) => {
  const theme = useTheme();

  const renderHeaderControl = () => {
    if (commonBtn?.Action) {
      return (
        <ActionButton
          variant={commonBtn.style || "contained"}
          onClick={commonBtn.Action}
          color={commonBtn.color ?? "primary"}
          sx={{
            "&:hover": {
              backgroundColor: commonBtn.color === "error" ? theme.palette.error.dark : undefined,
            },
          }}
        >
          {commonBtn.text || "Ver tudo"}
        </ActionButton>
      );
    }
    if (switchBtn) {
      return (
        <CustomSwitch
          title={switchBtn.value ? "Desativar" : "Ativar"}
          onClick={switchBtn.Action}
          checked={switchBtn.value}
        />
      );
    }
    return null;
  };

  const headerControl = renderHeaderControl();

  return (
    <Wrapper id={id} sx={sx}>
      {(title || headerControl) && (
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {title && <Typography variant={titleTagType}>{title}</Typography>}
            {headerControl}
          </Box>
          {hr && <Divider />}
        </Stack>
      )}
      {children}
    </Wrapper>
  );
};

export default ContentWrapper;
