import { Paper, Typography, Box, Tooltip, styled, PaperProps, Palette, SxProps, Theme } from "@mui/material";
import LabelTextWithTooltip from "../LabelTextWithTooltip";

type PaletteColorKey = keyof Pick<
  Palette,
  "primary" | "secondary" | "error" | "warning" | "info" | "success"
>;

type GenericCardProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: PaletteColorKey;
  iconSx?: SxProps<Theme>;
  children?: React.ReactNode;
  onClick?: () => void;
  sx?: PaperProps["sx"]; // Permite passar o sx para o Paper
  className?: string;
};

const CardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper, // Cor do tema!
  transition: theme.transitions.create(["box-shadow", "transform"], {
    duration: theme.transitions.duration.short,
  }),
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-5px)",
  },
}));

const IconWrapper = styled(Box, { shouldForwardProp: (prop) => prop !== "iconColor" })<{
  iconColor?: PaletteColorKey;
}>(({ theme, iconColor = "primary" }) => ({
  backgroundColor: theme.palette[iconColor].main,
  width: 50,
  height: 50,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const GenericCard = ({
  title,
  subtitle,
  icon,
  children,
  onClick,
  sx,
  className,
  iconColor,
  iconSx,
}: GenericCardProps) => {
  return (
    <CardPaper className={className} onClick={onClick} elevation={3} sx={sx}>
      <Box display="flex" alignItems="center" gap={2}>
        {icon && (
          <IconWrapper iconColor={iconColor} sx={iconSx}>
            {icon}
          </IconWrapper>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Tooltip
            title={title}
            slotProps={{ tooltip: { sx: { fontSize: "1.5rem" } } }}
            placement="bottom-start"
          >
            <Typography variant="h5" component="h2" color="text.primary" noWrap>
              {title}
            </Typography>
          </Tooltip>
          {subtitle && (
            <LabelTextWithTooltip
              text={subtitle}
              breakLine
              typographySX={{
                fontSize: "1.5rem",
                color: "text.secondary",
              }}
            />
          )}
        </Box>
      </Box>
      <Box>{children}</Box>
    </CardPaper>
  );
};

export default GenericCard;
