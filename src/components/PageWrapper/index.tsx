import { Box, Button, useTheme, Typography } from "@mui/material";
import CustomSwitch from "../CustomSwitch";

type PageWrapperProps = {
  children: React.ReactNode;
  title?: string;
  titleTagType?: "h1" | "h2" | "h3" | "h4";
  titleSize?: number;
  action?: "btn" | "switch";
  btn?: {
    Action?: () => void;
    style?: "outlined" | "contained" | "text";
    text?: string;
  };
  bgColor?: string;
  minHeightStyle?: string;
  wrapStyle?: string;
  gap?: string;
};
const PageWrapper = ({
  children,
  title,
  titleTagType,
  titleSize,
  action,
  btn,
  bgColor,
  minHeightStyle,
  wrapStyle,
  gap,
}: PageWrapperProps) => {
  const theme = useTheme();
  let btnField;
  if (action === "btn" && btn) {
    btnField = (
      <>
        <Button
          variant={btn.style || "contained"}
          sx={{ fontSize: "1.2rem", borderRadius: "1rem" }}
          onClick={btn.Action}
        >
          {btn.text || "Ver tudo"}
        </Button>
      </>
    );
  } else if (action === "switch") {
    btnField = <CustomSwitch defaultChecked />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexWrap: wrapStyle ? wrapStyle : "",
        justifyContent: "center",
        alignContent: "center",
        gap: gap ? gap : "3rem",
        backgroundColor: bgColor ?? theme.palette.background.paper,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        padding: "1.5rem",
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
        scrollBehavior: "smooth",
        width: "100%",
        minHeight: minHeightStyle ? minHeightStyle : "",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant={titleTagType ? titleTagType : "h1"} fontSize={titleSize || 32}>
          {title}
        </Typography>
        {btnField}
      </div>
      {children}
    </Box>
  );
};

export default PageWrapper;
