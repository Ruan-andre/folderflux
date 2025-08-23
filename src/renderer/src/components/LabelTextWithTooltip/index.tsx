import { SxProps, Theme, Tooltip, Typography } from "@mui/material";

// Estilo para quebra de linha com ellipsis após 2 linhas
const sxLineClamp = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
};

const LabelTextWithTooltip = ({
  text,
  tooltipText,
  typographySX,
  breakLine,
}: {
  text: string;
  tooltipText?: string;
  typographySX?: SxProps<Theme>;
  breakLine?: boolean;
}) => {
  const finalSx: SxProps<Theme> = [breakLine && sxLineClamp, typographySX].filter(Boolean) as SxProps<Theme>;

  return (
    <Tooltip title={tooltipText ?? text} slotProps={{ tooltip: { sx: { fontSize: "1.5rem" } } }}>
      <Typography sx={finalSx}>{text}</Typography>
    </Tooltip>
  );
};

export default LabelTextWithTooltip;
