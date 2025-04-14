import { useDropzone } from "react-dropzone";
import { Box, Typography, Button, Stack } from "@mui/material";
import Icon from "../../assets/icons/";

const FolderDropZone = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed #4a5a75",
        borderRadius: 2,
        backgroundColor: "#2d3646",
        padding: 5,
        textAlign: "center",
        cursor: "pointer",
        transition: "0.3s",
        width: "100%",
        height: "fit-content",
        ":hover": {
          backgroundColor: "#4361ee26",
          borderColor: (theme) => theme.palette.primary.main,
        },
      }}
    >
      <input
        {...getInputProps()}
        ref={(el) => {
          if (el) {
            el.setAttribute("webkitdirectory", "true");
            el.setAttribute("mozdirectory", "true");
          }
        }}
      />
      <Stack spacing={2} alignItems="center">
        <Icon icon="icon-park:folder-upload" width="45" height="45" />
        <Typography fontWeight={600} color="white" fontSize="1.8rem">
          Arraste pastas para organizar
        </Typography>
        <Typography color="var(--title-gray-dark)" fontSize="1.5rem">
          Solte suas pastas aqui ou clique para selecionar
        </Typography>
        <Button variant="contained" onClick={open} sx={{ fontSize: "1.5rem" }}>
          Selecionar Pastas
        </Button>
      </Stack>
    </Box>
  );
};

export default FolderDropZone;
