import { Paper, Typography, Box, Tooltip } from "@mui/material";

type GenericCardType = {
  title: string;
  subtitle?: string;
  bgColor?: string;
  border?: string;
  displayCardStyle?: string;
  flexDirectionCard?: "column" | "row";
  gapCard?: string;
  widthCard?: string;
  minWidthCard?: string;
  heightCard?: string;
  minHeightCard?: string;
  paddingCard?: number;
  icon?: React.ReactNode;
  bgColorIcon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

const GenericCard = ({
  title,
  subtitle,
  bgColor,
  border,
  widthCard,
  minWidthCard,
  heightCard,
  minHeightCard,
  paddingCard,
  displayCardStyle,
  flexDirectionCard,
  gapCard,
  icon,
  bgColorIcon,
  children,
  onClick,
}: GenericCardType) => {
  return (
    <Paper
      onClick={onClick}
      elevation={3}
      sx={{
        p: paddingCard ?? 3,
        display: displayCardStyle ?? "block",
        flexDirection: flexDirectionCard ?? "",
        justifyContent: "space-between",
        gap: gapCard ?? "0",
        borderRadius: 2,
        backgroundColor: bgColor || "#1e2533",
        border: border ?? "none",
        width: widthCard ?? "33rem",
        height: heightCard ?? "auto",
        minWidth: minWidthCard ?? widthCard ?? "20rem",
        minHeight: minHeightCard ?? heightCard ?? "20rem",
        transition: "0.3s",
        cursor: "pointer",
        backgroundImage: "none",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-5px)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {icon && (
          <Box
            sx={{
              bgcolor: bgColorIcon ?? "#2aaefc",
              width: 50,
              height: 50,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Tooltip
            title={title}
            slotProps={{ tooltip: { sx: { fontSize: "1.5rem" } } }}
            placement="bottom-start"
          >
            <Typography
              whiteSpace={"nowrap"}
              overflow={"hidden"}
              textOverflow={"ellipsis"}
              fontWeight={700}
              color="white"
              fontSize="2rem"
            >
              {title}
            </Typography>
          </Tooltip>
          {subtitle && (
            <Tooltip
              title={subtitle}
              slotProps={{ tooltip: { sx: { fontSize: "1.5rem" } } }}
              placement="bottom-start"
            >
              <Typography
                whiteSpace={"nowrap"}
                overflow={"hidden"}
                textOverflow={"ellipsis"}
                variant="body2"
                fontSize="1.5rem"
                color="var(--title-gray-dark)"
              >
                {subtitle}
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Box>{children}</Box>
    </Paper>
  );
};

export default GenericCard;
