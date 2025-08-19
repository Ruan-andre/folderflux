import { SxProps, Theme, Tooltip, Typography } from "@mui/material";

const sxBreakLine = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2, // Define o máximo de 2 linhas
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const LabelTextWithTooltip = ({
  text,
  tooltipText,
  typographySX,
  breakLine = false,
}: {
  text: string;
  tooltipText?: string;
  typographySX?: SxProps<Theme>;
  breakLine?: boolean;
}) => {
  const finalSx: SxProps<Theme> = [breakLine && sxBreakLine, typographySX].filter(Boolean) as SxProps<Theme>;

  return (
    <Tooltip title={tooltipText ?? text} slotProps={{ tooltip: { sx: { fontSize: "1.5rem" } } }}>
      <Typography sx={finalSx}>{text}</Typography>
    </Tooltip>
  );
};

export default LabelTextWithTooltip;
