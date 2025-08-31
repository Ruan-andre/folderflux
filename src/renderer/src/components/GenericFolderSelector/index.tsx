import { Box, Button, SxProps, Theme } from "@mui/material";
import GenericInput from "../GenericInput";

type GenericFolderSelectorProps = {
  value?: string;
  inputLabel?: string;
  btnLabel?: string;
  placeholder?: string;
  hideSearchButton?: boolean;
  sx: SxProps<Theme>;
  className?: string;
  onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const GenericFolderSelector = ({
  value = "",
  inputLabel,
  btnLabel,
  placeholder,
  hideSearchButton,
  sx,
  className,
  onChangeInput,
  ...rest
}: GenericFolderSelectorProps & React.HtmlHTMLAttributes<HTMLElement>) => {
  const handleBrowse = async () => {
    const selectedPath = await window.api.dialog.selectDirectory();
    if (selectedPath && onChangeInput) {
      const syntheticEvent = {
        target: { value: selectedPath, name: "folderSelectorInput" },
      } as React.ChangeEvent<HTMLInputElement>;

      onChangeInput(syntheticEvent);
    }
  };

  return (
    <Box display="flex" className={className} sx={sx} gap="1rem" {...rest}>
      <Box display="flex" gap={1} alignItems={"center"} justifyContent={"center"}>
        <Box flex={1}>
          <GenericInput
            id="folderSelectorInput"
            name="folderSelectorInput"
            value={value}
            onChangeInput={onChangeInput}
            label={inputLabel ?? ""}
            placeholder={placeholder ?? ""}
            inputSize="small"
          />
        </Box>
        {!hideSearchButton && (
          <Box>
            <Button
              id="folderSelectorButton"
              variant="outlined"
              onClick={handleBrowse}
              sx={{
                whiteSpace: "nowrap",
                borderRadius: 12,
                fontWeight: "bolder",
                marginTop: inputLabel ? 4 : 0,
              }}
              fullWidth
            >
              {btnLabel ?? "Procurar"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GenericFolderSelector;
