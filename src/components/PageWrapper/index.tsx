// components/layout/PageWrapper.tsx
import { Box, Button, useTheme } from "@mui/material";

type PageWrapperProps = {
  children: React.ReactNode;
  title?: string;
  btnAction?: () => void;
  minHeightStyle?: string;
  wrapStyle?: string;
};
const PageWrapper = ({ children, title, btnAction, minHeightStyle, wrapStyle }: PageWrapperProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexWrap: wrapStyle ? wrapStyle : "",
        justifyContent: "center",
        alignContent: "center",
        gap: "3rem",
        backgroundColor: theme.palette.background.paper ?? "#242a35",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
        padding: "1.5rem",
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
        scrollBehavior: "smooth",
        width: "100%",
        minHeight: minHeightStyle ? minHeightStyle : "",
      }}
    >
      {title && btnAction && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2> {title}</h2>
          <Button variant="outlined" sx={{ fontSize: "1.5rem", borderRadius: "1rem" }} onClick={btnAction}>
            Ver tudo
          </Button>
        </div>
      )}

      {children}
    </Box>
  );
};

export default PageWrapper;
