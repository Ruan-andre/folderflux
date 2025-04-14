import { Paper, Typography, Box } from "@mui/material";

type GenericCardType = {
  title: string;
  subtitle: string;
  bgColor?: string;
  children?: React.ReactNode;
};

const GenericCard = ({ title, subtitle, bgColor, children }: GenericCardType) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: bgColor || "#1e2533",
        width: "33rem",
        transition: "0.3s",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-5px)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {children && (
          <Box
            sx={{
              bgcolor: "#2aaefc",
              width: 45,
              height: 45,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </Box>
        )}

        <Box>
          <Typography fontWeight={700} color="white" fontSize="2rem">
            {title}
          </Typography>
          <Typography variant="body2" fontSize="1.5rem" color="var(--title-gray-dark)">
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GenericCard;
