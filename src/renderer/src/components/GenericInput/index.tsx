import { TextField, Typography, useTheme, Box, MenuItem, FormHelperText } from "@mui/material";

type SelectOption = {
  label: string;
  value: string | number;
};

type GenericInputProps = {
  name: string;
  id?: string;
  label?: string;
  labelSize?: string;
  textFieldType?: "outlined" | "standard" | "filled";
  placeholder?: string;
  inputLabel?: string;
  inputSize?: "small" | "medium";
  required?: boolean;
  borderRadius?: number | string;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  error?: boolean;
  fontSize?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  select?: boolean;
  selectOptions?: SelectOption[];
  maxLength?: number;
  bgColor?: string;
  borderColor?: string;
};

const GenericInput = ({
  name,
  id,
  label,
  labelSize,
  textFieldType,
  placeholder,
  inputLabel,
  inputSize,
  required,
  borderRadius,
  fullWidth,
  multiline,
  rows,
  helperText,
  error,
  fontSize,
  value = "",
  onChange,
  type,
  select,
  selectOptions = [],
  maxLength,
  bgColor,
  borderColor,
}: GenericInputProps) => {
  const theme = useTheme();
  const remaining = maxLength ? maxLength - value.length : undefined;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {/* Label personalizada */}
      {label && (
        <Typography fontSize={labelSize ?? "1.8rem"}>
          {label}
          {required && (
            <Typography fontSize={labelSize ?? "1.8rem"} component="span" color="error" ml={0.5}>
              *
            </Typography>
          )}
        </Typography>
      )}

      <TextField
        id={id}
        name={name}
        variant={textFieldType ?? "outlined"}
        size={inputSize ?? "medium"}
        placeholder={!label && required ? `${placeholder} *` : placeholder}
        label={inputLabel}
        required={required}
        fullWidth={fullWidth ?? true}
        multiline={multiline}
        rows={rows}
        helperText={helperText}
        error={error}
        value={value}
        onChange={onChange}
        type={type}
        select={select}
        slotProps={{
          htmlInput: {
            maxLength: maxLength,
          },
        }}
        sx={{
          backgroundColor: bgColor ?? "#2d3646", // Melhor fallback no tema
          "& .MuiOutlinedInput-root": {
            borderRadius: borderRadius ?? theme.shape.borderRadius,
            fontSize: fontSize ?? "1.4rem",
          },
          "& .MuiInputLabel-root": {
            fontSize: fontSize ?? "1.4rem",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: borderColor ?? "#4a5a75",
          },
        }}
      >
        {select &&
          selectOptions.length > 0 &&
          selectOptions.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
      </TextField>

      {/* Contador de caracteres */}
      {maxLength !== undefined && (
        <FormHelperText sx={{ alignSelf: "flex-end", fontSize: "1.2rem" }}>
          {remaining} caractere{remaining === 1 ? "" : "s"} restante
        </FormHelperText>
      )}
    </Box>
  );
};

export default GenericInput;
