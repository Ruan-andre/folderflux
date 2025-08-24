import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";
import GenericInput from "../GenericInput";
import { useState } from "react";

type PopupProps = {
  log: LogMetadata | null;
  isOpen: boolean;
  onClose: () => void;
};

const getDescriptiveErrorReason = (reason: PromiseRejectedResult | undefined | null): string => {
  if (typeof reason === "string") {
    return reason;
  }
  if (reason && "code" in reason && (reason.code as string).includes("EBUSY")) {
    return "Arquivo estava sendo usado no momento do processamento da regra";
  }
  return "Erro";
};

const OrganizationLogPopup = ({ log, isOpen, onClose }: PopupProps) => {
  const [textSearch, setTextSearch] = useState("");

  if (!log) return null;

  const getHeaders = () => {
    switch (log.type) {
      case "error":
        return ["Arquivo", "Motivo do Erro"];
      case "cleanup":
        return ["Arquivo Removido"];
      case "organization":
      default:
        return ["Caminho Original", "Novo Caminho / Nome"];
    }
  };

  const tableRows = log?.files ?? [];
  const renderRowContent = (item: {
    currentValue: string;
    newValue?: string | null;
    reason?: PromiseRejectedResult | null;
  }) => {
    if (item) {
      const errorReason = getDescriptiveErrorReason(item.reason);
      switch (log.type) {
        case "error":
          return (
            <>
              <TableCell sx={{ fontSize: "1.5rem" }}>{item.currentValue}</TableCell>
              <TableCell sx={{ color: "error.main", fontSize: "1.5rem" }}>{errorReason}</TableCell>
            </>
          );
        case "cleanup":
          return (
            <TableCell colSpan={2} sx={{ fontSize: "1.5rem" }}>
              {item.currentValue}
            </TableCell>
          ); 
        case "organization":
          return (
            <>
              <TableCell sx={{ fontSize: "1.3rem" }}>{item.currentValue}</TableCell>
              <TableCell sx={{ fontSize: "1.3rem" }}>{item.newValue}</TableCell>
            </>
          );
        default:
          return null;
      }
    }
  };

  const filteredRows = tableRows.filter((item) => {
    if (!textSearch) return true;
    const normalizedSearch = textSearch.toLowerCase();
    const hasInCurrentValue = item.currentValue.toLowerCase().includes(normalizedSearch);
    const hasInNewValue = item.newValue?.toLowerCase().includes(normalizedSearch) ?? false;
    const errorReasonText = getDescriptiveErrorReason(item.reason);
    const hasInErrorReason = errorReasonText.toLowerCase().includes(normalizedSearch);

    return hasInCurrentValue || hasInNewValue || hasInErrorReason;
  });

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth  maxWidth="lg">
      <DialogTitle variant="h3" sx={{ fontWeight: 700 }}>
        {log.title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {log.description}
        </Typography>
        <Box mt={5}>
          <GenericInput
            name="search"
            value={textSearch}
            placeholder="Pesquisar"
            textFieldType="outlined"
            inputWidth={"40%"}
            onChange={(e) => {
              setTextSearch(e.target.value);
            }}
          />
        </Box>

        {filteredRows && filteredRows.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: "60vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {getHeaders().map((header) => (
                    <TableCell
                      key={header}
                      sx={{ fontWeight: "bold", backgroundColor: "background.paper", fontSize: "1.8rem" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((item, index) => (
                  <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    {renderRowContent(item)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 2, fontSize: "1.5rem" }} color="text.secondary">
            {textSearch
              ? "Nenhum resultado encontrado para sua busca."
              : "Nenhum arquivo foi afetado nesta operação."}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          sx={{ borderRadius: 2, marginRight: 2 }}
          color="error"
          size="large"
          onClick={onClose}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrganizationLogPopup;
