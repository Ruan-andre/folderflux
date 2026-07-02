import { useEffect, useState, useMemo, useRef, RefObject } from "react";
import {
  Box,
  Typography,
  styled,
  useTheme,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ContentWrapper from "../../components/ContentWrapper";
import GenericCard from "../../components/GenericCard";
import Icon from "../../assets/icons";
import GenericListItems from "../../components/GenericListItems";
import GenericListItemsType from "../../types/GenericListItemsType";
import CommonIcons from "../../types/CommonIconsType";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { format, subMonths } from "date-fns";
import { LogMetadata, ReportStats, ReportStatsFilters, LogTypes } from "@/shared/types/LogMetaDataType";
import OrganizationLogPopup from "../../components/OrganizationLogPopup";
import { useIntersectionObserver } from "../../hooks/intersectionObserverHook";
import { maskDate, isValidDate, convertToApiFormat } from "../../functions/formatDate";

const ReportCard = styled(GenericCard)(({ theme }) => ({
  flex: 1,
  minWidth: "300px",
  height: "12rem",
  backgroundColor: theme.palette.mode === "dark" ? "#1e2533" : "#f5f2ef",
  borderRadius: 8,
  border: theme.palette.mode === "light" ? "1px solid #e8e4e0" : "none",
  pointerEvents: "none",
}));

const ChartAndListWrapper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  borderRadius: 8,
  backgroundColor: theme.palette.mode === "dark" ? "#1e2533" : "#f5f2ef",
  border: theme.palette.mode === "light" ? "1px solid #e8e4e0" : "none",
  display: "flex",
  flexDirection: "column",
}));

const ReportPage = () => {
  const theme = useTheme();

  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 3), "dd/MM/yyyy"));
  const [endDate, setEndDate] = useState(format(new Date(), "dd/MM/yyyy"));
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [logType, setLogType] = useState<LogTypes | "">("");

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [logs, setLogs] = useState<LogMetadata[]>([]);
  const [lastLogId, setLastLogId] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const lastLogRef = useRef<HTMLLIElement>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogMetadata | null>(null);

  const [isFetchingData, setIsFetchingData] = useState(false);

  const [showOrganized, setShowOrganized] = useState(true);
  const [showCleaned, setShowCleaned] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  const isStartDateError = startDate.length > 0 && startDate.length === 10 && !isValidDate(startDate);
  const isEndDateError = endDate.length > 0 && endDate.length === 10 && !isValidDate(endDate);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 2000);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Busca inicial e toda vez que os filtros mudam
  useEffect(() => {
    const fetchFirstPage = async () => {
      if (startDate.length > 0 && !isValidDate(startDate)) return;
      if (endDate.length > 0 && !isValidDate(endDate)) return;

      setIsFetchingData(true);

      const filters: ReportStatsFilters = {
        startDate: convertToApiFormat(startDate),
        endDate: convertToApiFormat(endDate),
        searchTerm: debouncedSearchTerm || undefined,
        type: logType || undefined,
      };

      const responseStats = await window.api.organization.getReportStats(filters);
      if (responseStats.status && responseStats.items) {
        setStats(responseStats.items);
      }

      setIsLoadingLogs(true);
      const responseLogs = await window.api.organization.getLogs(undefined, filters);
      if (responseLogs.status && responseLogs.items) {
        setLogs(responseLogs.items);
        setHasMore(responseLogs.items.length === 10);
      } else {
        setLogs([]);
        setHasMore(false);
      }
      setLastLogId(undefined);
      setIsLoadingLogs(false);
      setIsFetchingData(false);
    };
    fetchFirstPage();
  }, [startDate, endDate, debouncedSearchTerm, logType]);


  useEffect(() => {
    const fetchNextPage = async () => {
      if (!lastLogId) return;
      setIsLoadingLogs(true);

      const filters: ReportStatsFilters = {
        startDate: convertToApiFormat(startDate),
        endDate: convertToApiFormat(endDate),
        searchTerm: debouncedSearchTerm || undefined,
        type: logType || undefined,
      };

      const responseLogs = await window.api.organization.getLogs(lastLogId, filters);
      if (responseLogs.status && responseLogs.items) {
        setLogs((prev) => [...prev, ...(responseLogs.items || [])]);
        setHasMore(responseLogs.items.length === 10);
      } else {
        setHasMore(false);
      }
      setIsLoadingLogs(false);
    };
    fetchNextPage();
  }, [debouncedSearchTerm, endDate, lastLogId, logType, startDate]);

  useIntersectionObserver(lastLogRef as RefObject<Element>, () => {
    if (isLoadingLogs || !hasMore || logs.length === 0) return;
    const nextId = logs[logs.length - 1].id;
    setLastLogId(nextId);
  });

  const recentActivityList: GenericListItemsType[] = useMemo(() => {
    return logs.map((item) => {
      const icon =
        item.type === "organization"
          ? CommonIcons.find((x) => x.value === "folder")
          : item.type === "cleanup"
            ? CommonIcons.find((x) => x.value === "clean")
            : CommonIcons.find((x) => x.value === "folder-error");
      return {
        id: item.id,
        title: item.title,
        subtitle: item.description,
        icon: icon?.icon,
        dateItem: item.createdAt,
      };
    });
  }, [logs]);

  const handleOpenDetails = (logId: number) => {
    const logToShow = logs.find((log) => log.id === logId);
    if (logToShow) {
      setSelectedLog(logToShow);
      setIsDetailsOpen(true);
    }
  };

  const renderLoaderOverlay = () => {
    if (!isFetchingData) return null;
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            theme.palette.mode === "dark" ? "rgba(30, 37, 51, 0.6)" : "rgba(245, 242, 239, 0.6)",
          zIndex: 10,
          borderRadius: 2,
          backdropFilter: "blur(2px)",
        }}
      >
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  };

  return (
    <ContentWrapper
      id="report-page"
      title="Relatórios"
      titleTagType="h1"
      sx={{ minHeight: "95vh", display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "space-between",
          mb: 2,
          width: "100%",
        }}
      >
        <ReportCard
          id="total-organized-card"
          title="Arquivos Organizados"
          subtitle={`${stats?.totalOrganized || 0} arquivos`}
          icon={<Icon icon="fluent-emoji:file-folder" width="45" height="45" />}
          iconSx={{ backgroundColor: "transparent" }}
        />
        <ReportCard
          id="total-cleanup-card"
          title="Limpeza (Excluídos)"
          subtitle={`${stats?.totalCleaned || 0} arquivos (${stats?.totalSpaceFreedMB || "0.00"} MB)`}
          icon={<Icon icon="streamline-plump-color:clean-broom-wipe-flat" width="45" height="45" />}
          iconSx={{ backgroundColor: "transparent" }}
        />
        <ReportCard
          id="total-errors-card"
          title="Falhas Detectadas"
          subtitle={`${stats?.totalErrors || 0} erros`}
          icon={<Icon icon="material-icon-theme:folder-error-open" width="45" height="45" />}
          iconSx={{ backgroundColor: "transparent" }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          height: "45rem",
          width: "100%",
        }}
      >
        <ChartAndListWrapper elevation={8} sx={{ flex: 1.5, position: "relative" }}>
          {renderLoaderOverlay()}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h5" color="text.primary">
              Atividade no Período
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={showOrganized} onChange={(e) => setShowOrganized(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" sx={{ fontSize: "1.2rem" }}>Organizados</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={showCleaned} onChange={(e) => setShowCleaned(e.target.checked)} color="error" />}
                label={<Typography variant="body2" sx={{ fontSize: "1.2rem" }}>Excluídos</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    size="small" 
                    checked={showErrors} 
                    onChange={(e) => setShowErrors(e.target.checked)} 
                    sx={{ color: theme.palette.warning.main, '&.Mui-checked': { color: theme.palette.warning.main } }} 
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: "1.2rem" }}>Falhas</Typography>}
              />
            </Box>
          </Box>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 8,
                  border: "1px solid #e8e4e0",
                }}
                cursor={{
                  fill: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              {showOrganized && (
                <Bar
                  dataKey="Organizados"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              )}
              {showCleaned && (
                <Bar 
                  dataKey="Excluidos" 
                  fill={theme.palette.error.main} 
                  radius={[4, 4, 0, 0]} 
                  barSize={30} 
                />
              )}
              {showErrors && (
                <Bar 
                  dataKey="Falhas" 
                  fill={theme.palette.warning.main} 
                  radius={[4, 4, 0, 0]} 
                  barSize={30} 
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartAndListWrapper>

        <ChartAndListWrapper elevation={8} sx={{ flex: 1, position: "relative" }}>
          {renderLoaderOverlay()}
          <Typography variant="h5" mb={2} color="text.primary">
            Histórico e Busca
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              size="small"
              placeholder="DD/MM/AAAA"
              label="De"
              error={isStartDateError}
              value={startDate}
              onChange={(e) => setStartDate(maskDate(e.target.value))}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              placeholder="DD/MM/AAAA"
              label="Até"
              error={isEndDateError}
              value={endDate}
              onChange={(e) => setEndDate(maskDate(e.target.value))}
              sx={{ flex: 1 }}
            />
          </Box>
          <FormControl size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel id="log-type-select-label">Tipo de Registro</InputLabel>
            <Select
              labelId="log-type-select-label"
              value={logType}
              label="Tipo de Registro"
              onChange={(e) => setLogType(e.target.value as LogTypes | "")}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="organization">Organização</MenuItem>
              <MenuItem value="cleanup">Limpeza</MenuItem>
              <MenuItem value="error">Falha</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            placeholder="Pesquisar arquivo ou log..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setDebouncedSearchTerm(searchTerm);
              }
            }}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setDebouncedSearchTerm(searchTerm)}
                      edge="end"
                      title="Pesquisar"
                    >
                      <Icon icon="fluent:search-24-filled" width="24" height="24" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {recentActivityList.length > 0 && !isFetchingData ? (
            <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
              <GenericListItems
                id="recent-activity-list-reports"
                isButton={true}
                btnDelete={false}
                lastItemRef={lastLogRef as RefObject<HTMLLIElement>}
                onClickListItem={handleOpenDetails}
                list={recentActivityList}
                sx={{
                  "& .MuiListItemText-primary": { fontSize: "1.4rem" },
                  "& .MuiListItemText-secondary": { fontSize: "1.2rem" },
                }}
              />
            </Box>
          ) : (
            <Typography fontSize={"1.3rem"} textAlign={"center"} color="text.secondary" mt={4}>
              {isFetchingData || isLoadingLogs
                ? "Buscando logs..."
                : "Nenhum registro encontrado neste período"}
            </Typography>
          )}
        </ChartAndListWrapper>
      </Box>
      <OrganizationLogPopup
        key={selectedLog?.id}
        log={selectedLog}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </ContentWrapper>
  );
};

export default ReportPage;
