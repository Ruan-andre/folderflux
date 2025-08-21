import { useEffect, useState, useRef, RefObject } from "react";
import { Modal, Typography } from "@mui/material";
import ContentWrapper from "../../components/ContentWrapper";
import FolderDropZone from "../../components/FolderDropZone";
import GenericListItems from "../../components/GenericListItems";
import RuleManagementView from "../RuleManagementView";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import GenericListItemsType from "../../types/GenericListItemsType";
import CommonIcons from "../../types/CommonIconsType";
import { useSnackbar } from "../../context/SnackBarContext";
import { DbResponse } from "~/src/shared/types/DbResponse";
import OrganizationLogPopup from "../../components/OrganizationLogPopup";
import { AlertColor } from "@mui/material";
import GenericCard from "../../components/GenericCard";
import Icon from "../../assets/icons";
import { LogMetadata } from "~/src/shared/types/LogMetaDataType";
import { useIntersectionObserver } from "../../hooks/intersectionObserverHook"; // ✅ IMPORTADO
import { PathStats } from "~/src/shared/types/pathStatsType";
import { useLogStore } from "../../store/logStore";

const HomePage = () => {
  const { showConfirm } = useConfirmDialog();
  const { showMessage } = useSnackbar();

  const [isRuleSelectorOpen, setIsRuleSelectorOpen] = useState<boolean>(false);
  const [foldersForQuickClean, setFoldersForQuickClean] = useState<string[]>([]);
  const [lastLogId, setLastLogId] = useState<number | undefined>(undefined);
  const lastLogRef = useRef<HTMLLIElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogMetadata | null>(null);
  const logs = useLogStore((state) => state.logs);
  const deleteAllLogs = useLogStore((state) => state.deleteAllLogs);
  const getLogs = useLogStore((state) => state.getLogs);
  const deleteLog = useLogStore((state) => state.deleteLog);
  const addSavedLogFromBD = useLogStore((state) => state.addSavedLogFromBD);

  useEffect(() => {
    async function fetchData() {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      try {
        const newLogsCount = await getLogs(lastLogId);
        if (newLogsCount && newLogsCount < 10) {
          setHasMore(false);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLogs, lastLogId]);

  useEffect(() => {
    console.count("vezes");
    const removeListener = window.api.onLogAdded((log) => addSavedLogFromBD(log));
    return () => removeListener();
  }, [addSavedLogFromBD]);

  const recentActivityList: GenericListItemsType[] = logs.map((item) => {
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

  useIntersectionObserver(lastLogRef as RefObject<Element>, () => {
    if (isLoading || !hasMore || logs.length === 0) return;
    const nextId = logs[logs.length - 1].id;
    setLastLogId(nextId);
  });

  const handleOpenDetails = (logId: number) => {
    const logToShow = logs.find((log) => log.id === logId);
    if (logToShow) {
      let logMetadata: LogMetadata;
      const { type } = logToShow;
      switch (type) {
        case "organization":
          logMetadata = {
            ...logToShow,
            type,
          };
          break;
        case "cleanup":
          logMetadata = {
            ...logToShow,
            type,
          };
          break;
        case "error":
          logMetadata = {
            ...logToShow,
            type,
          };
          break;
        default:
          throw new Error(`Tipo de log desconhecido: ${type}`);
      }
      setSelectedLog(logMetadata);
      setIsDetailsOpen(true);
    }
  };

  const handleItemsDropped = async (paths: string[], handleError?: () => void) => {
    if (!paths || paths.length === 0) return;
    const stats = await window.api.getStatsForPaths(paths);
    const folders = stats.filter((s) => s.isDirectory).map((f) => f.path);
    if (folders.length > 0) showQuickCleanOptions(folders);
    else if (handleError) handleError();
  };

  const handleClickSelectFolder = async () => {
    const paths = await window.api.dialog.selectMultipleDirectories();
    if (paths && paths.length > 0) showQuickCleanOptions(paths);
  };

  const handleRuleSelectionSave = async (selectedRules: FullRule[]) => {
    setIsRuleSelectorOpen(false);
    if (foldersForQuickClean.length > 0 && selectedRules.length > 0) {
      const response = await window.api.organization.organizeWithSelectedRules(
        selectedRules,
        foldersForQuickClean
      );

      handleMessage(response);
      if (response.items && response.items > 0) {
        setLastLogId(undefined);
        getLogs();
      }
    }
  };

  async function montaMensagemPastas(folders: PathStats[] | string[]) {
    let folderNames = "";
    let stats: PathStats[] = folders as PathStats[];
    if (typeof folders[0] === "string") stats = await window.api.getStatsForPaths(folders as string[]);
    folderNames = stats.map((f, index) => `\n${++index} ${f.name}`).join("");

    return `Organizar ${folders.length} pasta(s):\n${folderNames}`;
  }
  async function showQuickCleanOptions(folderPaths: string[]) {
    const message = await montaMensagemPastas(folderPaths);
    showConfirm(
      {
        message,
        confirmText: "Usar Perfil Padrão",
        thirdButton: { text: "Selecionar Regras" },
        confirmBtnColor: "success",
      },
      async () => {
        const response = await window.api.organization.defaultOrganization(folderPaths);
        if (response.items && response.items > 0) {
          getLogs();
        }
        handleMessage(response);
      },
      async () => {
        // Ação para "Selecionar Regras"
        setFoldersForQuickClean(folderPaths);
        setIsRuleSelectorOpen(true);
      }
    );
  }

  function handleMessage(response: DbResponse<number>) {
    let messageType: AlertColor = response.status ? "success" : "error";
    if (response.status && response.items === 0) messageType = "info";
    showMessage(response.message, messageType);
  }

  const handleDeleteAllLogs = async () => {
    showConfirm({}, async () => {
      const response = await deleteAllLogs();
      const messageType = response.status ? "success" : "error";
      showMessage(response.message, messageType);
      setLastLogId(undefined);
    });
  };

  const handleDeleteLogById = async (logId: number) => {
    const response = await deleteLog(logId);
    const messageType = response.status ? "success" : "error";
    showMessage(response.message, messageType);
  };

  async function handleClickForceVerification() {
    const response = await window.api.organization.organizeAll();
    handleMessage(response);
  }

  return (
    <ContentWrapper minHeightStyle="95vh" justifyContent="flex-start">
      <div className="flex-center">
        <GenericCard
          title="Forçar Verificação"
          subtitle="Verifica todas as pastas monitoradas imediatamente"
          icon={<Icon icon="vscode-icons:file-type-syncpack" width="45" height="45" />}
          bgColorIcon="none"
          widthCard="35rem"
          heightCard="11rem"
          onClick={handleClickForceVerification}
        />

        <GenericCard
          title="Status dos Perfis"
          subtitle="3 perfis Ativos, 1 Inativo"
          icon={<Icon icon="fluent-color:person-16" width="45" height="45" />}
          bgColorIcon="none"
          widthCard="35rem"
          heightCard="11rem"
        />

        <GenericCard
          title="Como usar?"
          subtitle="Guia rápido de início"
          icon={<Icon icon="noto-v1:graduation-cap" width="45" height="45" />}
          bgColorIcon="none"
          widthCard="35rem"
          heightCard="11rem"
        />
      </div>
      <FolderDropZone onClick={handleClickSelectFolder} onItemsDropped={handleItemsDropped} />
      <ContentWrapper
        title="Atividade Recente"
        maxHeightStyle={"52rem"}
        commonBtn={
          recentActivityList.length > 0
            ? {
                text: "Apagar todos",
                style: "outlined",
                color: "error",
                Action: () => handleDeleteAllLogs(),
              }
            : undefined
        }
        hr
      >
        {recentActivityList.length > 0 ? (
          <>
            <GenericListItems
              isButton
              btnDelete
              onClickDelete={handleDeleteLogById}
              onClickListItem={handleOpenDetails}
              lastItemRef={lastLogRef as RefObject<HTMLLIElement>}
              list={recentActivityList}
            />
          </>
        ) : (
          <Typography fontSize={"1.4rem"} textAlign={"center"}>
            Nenhum registro
          </Typography>
        )}
      </ContentWrapper>

      <Modal
        open={isRuleSelectorOpen}
        onClose={() => setIsRuleSelectorOpen(false)}
        sx={{ bgcolor: "background.paper", borderRadius: 8, width: "90vw", height: "90vh", margin: "auto" }}
      >
        <RuleManagementView
          mode="selection"
          initialSelectedRules={undefined}
          onSelectionSave={handleRuleSelectionSave}
          onCancel={() => setIsRuleSelectorOpen(false)}
        />
      </Modal>
      <OrganizationLogPopup
        key={selectedLog?.id}
        log={selectedLog}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </ContentWrapper>
  );
};

export default HomePage;
