import {
  TextField,
  Typography,
  useTheme,
  Box,
  MenuItem,
  FormHelperText,
  SxProps,
  Theme,
} from "@mui/material";

type SelectOption = {
  label: string;
  value: string | number;
};

type GenericInputProps = {
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  inputLabel?: string;
  inputSize?: "small" | "medium";
  required?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  error?: boolean;
  value?: string;
  type?: React.HTMLInputTypeAttribute | undefined;
  select?: boolean;
  selectOptions?: SelectOption[];
  maxLength?: number;
  onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputWidth?: number | string;
  margin?: string | number;
  textFieldType?: "outlined" | "standard" | "filled";
  bgColor?: "default" | string;
  sx?: SxProps<Theme>;
  inputSx?: SxProps<Theme>;
};

const GenericInput = ({
  name,
  id,
  label,
  placeholder,
  inputLabel,
  inputSize,
  required,
  fullWidth,
  multiline,
  rows,
  helperText,
  error,
  value = "",
  onChangeInput: onChange,
  type,
  select,
  selectOptions = [],
  maxLength,
  inputWidth,
  margin,
  textFieldType,
  bgColor,
  sx,
  inputSx,
  ...rest
}: GenericInputProps & React.HtmlHTMLAttributes<HTMLElement>) => {
  const theme = useTheme();
  const remaining = maxLength ? maxLength - value.length : undefined;

  const inputBgColor =
    select && !bgColor
      ? "transparent"
      : !bgColor || bgColor === "default"
        ? theme.palette.background.paper
        : bgColor;

  return (
    <Box
      display="flex"
      component={!fullWidth ? "span" : "div"}
      flexDirection="column"
      gap={1}
      width={inputWidth ?? "100%"}
      maxWidth="100%"
      margin={margin}
      sx={sx}
      {...rest}
    >
      {/* Label personalizada */}
      {label && (
        <Typography
          sx={{
            fontSize: "1.8rem",
            color: theme.palette.text.primary,
          }}
        >
          {label}
          {required && (
            <Typography
              component="span"
              color="error"
              ml={0.5}
              sx={{
                fontSize: "1.8rem",
              }}
            >
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
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth ?? true}
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
          backgroundColor: inputBgColor,
          "& .MuiOutlinedInput-root": {
            borderRadius: theme.shape.borderRadius,
            fontSize: "1.4rem",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            },
          },
          "& .MuiInputLabel-root": {
            fontSize: "1.4rem",
            color: theme.palette.text.secondary,
            "&.Mui-focused": {
              color: theme.palette.primary.main,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "& .MuiInputBase-input": {
            color: theme.palette.text.primary,
            "&::placeholder": {
              color: theme.palette.text.secondary,
              opacity: 0.7,
            },
          },
          "& .MuiFormHelperText-root": {
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
          },
          ...inputSx,
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
        <FormHelperText
          sx={{
            alignSelf: "flex-end",
            fontSize: "1.2rem",
            color: theme.palette.text.secondary,
          }}
        >
          {remaining} caractere{remaining === 1 ? "" : "s"} restante
        </FormHelperText>
      )}
    </Box>
  );
};

export default GenericInput;
