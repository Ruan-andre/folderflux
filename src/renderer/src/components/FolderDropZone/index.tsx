import { useState, DragEvent } from "react";
import { Box, Typography, Stack, useTheme } from "@mui/material";
import Icon from "../../assets/icons/";

interface FolderDropZoneProps {
  onClick: () => void;
  onItemsDropped: (paths: string[], callback?: () => void) => void;
}

const FolderDropZone = ({ onClick, onItemsDropped }: FolderDropZoneProps) => {
  const theme = useTheme();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const preventDefaults = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLElement>) => {
    preventDefaults(e);
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    preventDefaults(e);
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    preventDefaults(e);

    setIsDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const paths = window.api.onFileDrop(fileArray);
      onItemsDropped(paths, () => {
        setIsInvalid(true);
        setTimeout(() => {
          setIsInvalid(false);
        }, 3000);
      });
    }
  };

  const borderColor = isInvalid
    ? "error.main"
    : isDragActive
      ? "success.main"
      : theme.palette.mode === "dark"
        ? "#4a5a75"
        : "#d1ccc8";
  const backgroundColor = isInvalid
    ? "rgba(175, 76, 76, 0.1)"
    : isDragActive
      ? "rgba(76, 175, 80, 0.1)"
      : theme.palette.mode === "dark"
        ? "#2d3646"
        : "#f5f2ef";
  const fontColor = isInvalid ? "error.main" : isDragActive ? "success.main" : theme.palette.text.primary;

  return (
    <Box
      onClick={onClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={preventDefaults}
      onDrop={handleDrop}
      sx={{
        border: "2px dashed",
        borderColor,
        backgroundColor,
        borderRadius: 2,
        padding: 5,
        textAlign: "center",
        cursor: "pointer",
        transition: "border-color 0.3s, background-color 0.3s, transform 0.2s ease-out",
        transform: isDragActive ? "scale(1.02)" : "scale(1)",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        sx={{
          pointerEvents: "none",
        }}
      >
        <Icon
          icon={isDragActive ? "mdi:folder-check-outline" : "icon-park:folder-upload"}
          width="45"
          height="45"
          color={isDragActive ? "#4caf50" : "inherit"}
        />
        <Typography fontWeight={600} color={theme.palette.text.primary} fontSize="1.8rem">
          Organizar Pastas
        </Typography>
        <Typography fontWeight={isDragActive ? 600 : 400} color={fontColor} fontSize="1.5rem">
          {isInvalid
            ? "Arraste somente pastas!!"
            : isDragActive
              ? "Pode soltar!"
              : "Arraste as pastas aqui ou clique para selecionar"}
        </Typography>
      </Stack>
    </Box>
  );
};

export default FolderDropZone;
