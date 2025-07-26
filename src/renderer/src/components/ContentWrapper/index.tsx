import { Box, Button, useTheme, Typography, Stack } from "@mui/material";
import CustomSwitch from "../CustomSwitch";

type ContentWrapperProps = {
  children: React.ReactNode;
  title?: string;
  titleTagType?: "h1" | "h2" | "h3" | "h4";
  titleSize?: number;
  switchBtn?: {
    Action?: () => void;
    value?: boolean;
  };
  commonBtn?: {
    Action?: () => void;
    style?: "outlined" | "contained" | "text";
    text?: string;
  };
  bgColor?: string;
  minHeightStyle?: string;
  wrapStyle?: string;
  gap?: string;
  padding?: string;
  hr?: boolean;
  alignItems?: string;
  justifyContent?: string;
  boxShadow?: string;
};
const ContentWrapper = ({
  children,
  title,
  titleTagType,
  titleSize,
  switchBtn,
  commonBtn,
  bgColor,
  minHeightStyle,
  wrapStyle,
  gap,
  padding,
  hr,
  alignItems,
  justifyContent,
  boxShadow,
}: ContentWrapperProps) => {
  const theme = useTheme();
  let btnField;
  if (commonBtn) {
    btnField = (
      <>
        <Button
          variant={commonBtn.style || "contained"}
          sx={{ fontSize: "1rem", borderRadius: "1rem" }}
          onClick={commonBtn.Action}
        >
          {commonBtn.text || "Ver tudo"}
        </Button>
      </>
    );
  } else if (switchBtn) {
    btnField = (
      <CustomSwitch
        title={switchBtn.value ? "Desativar" : "Ativar"}
        onClick={switchBtn.Action}
        checked={switchBtn.value}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexWrap: wrapStyle ? wrapStyle : "",
        justifyContent: justifyContent ?? "center",
        alignItems: alignItems ?? "",
        gap: gap ? gap : "3rem",
        backgroundColor: bgColor ?? theme.palette.background.paper,
        boxShadow: boxShadow ?? "0 4px 12px rgba(0, 0, 0, 0.4)",
        padding: padding ?? "1.5rem",
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
        overflow: "auto",
        scrollBehavior: "smooth",
        width: "100%",
        minHeight: minHeightStyle ? minHeightStyle : "",
      }}
    >
      <Stack direction={"column"} spacing={1}>
        {(title || btnField) && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant={titleTagType ? titleTagType : "h1"} fontSize={titleSize || 32}>
              {title}
            </Typography>
            {btnField}
          </Box>
        )}

        {hr && <hr />}
      </Stack>
      {children}
    </Box>
  );
};

export default ContentWrapper;
