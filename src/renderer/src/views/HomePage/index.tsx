import { useEffect, useState, useRef, RefObject } from "react";
import { Box, Modal, styled, Typography } from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import DonationPopup from "../../components/DonationPopup";
import ProfileManagementView from "../ProfileManagementView";
import { FullProfile } from "~/src/shared/types/ProfileWithDetails";
import Loading from "../../components/Loading";
import { useTourStore } from "../../store/tourStore";

const HomePage = () => {
  const { showMessage } = useSnackbar();
  const { showConfirm } = useConfirmDialog();
  const navigate = useNavigate();

  const [isRuleSelectorOpen, setIsRuleSelectorOpen] = useState<boolean>(false);
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState<boolean>(false);
  const [foldersForQuickClean, setFoldersForQuickClean] = useState<string[]>([]);
  const [lastLogId, setLastLogId] = useState<number | undefined>(undefined);
  const lastLogRef = useRef<HTMLLIElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogMetadata | null>(null);
  const [profilesLegend, setProfilesLegend] = useState("");
  const logs = useLogStore((state) => state.logs);
  const deleteAllLogs = useLogStore((state) => state.deleteAllLogs);
  const getLogs = useLogStore((state) => state.getLogs);
  const deleteLog = useLogStore((state) => state.deleteLog);
  const addSavedLogFromBD = useLogStore((state) => state.addSavedLogFromBD);
  const [isDonationPopupOpen, setIsDonationPopupOpen] = useState(false);
  const { startTour, tourNext, isTourActive, getCurrentStepId, initializeTour } = useTourStore();

  useEffect(() => {
    initializeTour(navigate);
    // const tourHasBeenSeen = localStorage.getItem("folderfluxTourCompleted");
    // if (!tourHasBeenSeen) {
    //   setTimeout(() => startTour("simple"), 500);
    // }
  }, [initializeTour, navigate]);

  useEffect(() => {
    async function fetchData() {
      if (isLoading || !hasMore) return;

      handleActionWithLoading(async () => {
        const newLogsCount = await getLogs(lastLogId);
        if (newLogsCount && newLogsCount < 10) {
          setHasMore(false);
        }
      }, false);
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLogs, lastLogId]);

  useEffect(() => {
    handleSubTitleProfiles();
    const removeListener = window.api.onLogAdded((log) => addSavedLogFromBD(log));
    return () => removeListener();
  }, [addSavedLogFromBD]);

  useIntersectionObserver(lastLogRef as RefObject<Element>, () => {
    if (isLoading || !hasMore || logs.length === 0) return;
    const nextId = logs[logs.length - 1].id;
    setLastLogId(nextId);
  });

  const handleHowToUse = () => {
    showConfirm(
      {
        title: "Escolha uma opção",
        confirmText: "Tutorial Guiado",
        confirmBtnColor: "success",
      },
      () => startTour("simple"),
      [{ text: "Tutorial em Vídeo", action: () => {}, thirdButtonColor: "info" }]
    );
  };

  async function handleActionWithLoading<T>(
    action: () => Promise<DbResponse<T>> | Promise<void>,
    message?: boolean
  ) {
    setIsLoading(true);
    try {
      const response = await action();
      if (message && response) handleMessage(response);
    } catch (error) {
      showMessage((error as Error).message, "error");
    } finally {
      setIsLoading(false);
    }
  }
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
      if (isTourActive() && getCurrentStepId() === "recent-activity-list") {
        setTimeout(() => {
          tourNext();
        }, 250);
      }
    }
  };

  const handleItemsDropped = async (paths: string[], handleError?: () => void) => {
    if (!paths || paths.length === 0) return;
    const stats = await window.api.getStatsForPaths(paths);
    const folders = stats.filter((s) => s.isDirectory).map((f) => f.path);
    if (folders.length > 0) showQuickOrganizationOptions(folders);
    else if (handleError) handleError();
  };

  const handleSelectFolderClick = async () => {
    const paths = await window.api.dialog.selectMultipleDirectories(isTourActive());

    if (paths && paths.length > 0) {
      showQuickOrganizationOptions(paths);
      if (isTourActive() && getCurrentStepId() === "click-drop-zone") {
        setTimeout(() => tourNext(), 250);
      }
    }
  };

  const handleRuleSelectionSave = async (selectedRules: FullRule[]) => {
    setIsRuleSelectorOpen(false);
    if (foldersForQuickClean.length > 0 && selectedRules.length > 0) {
      handleActionWithLoading(async () => {
        const response = await window.api.organization.organizeWithSelectedRules(
          selectedRules,
          foldersForQuickClean
        );
        if (response.items && response.items > 0) {
          setLastLogId(undefined);
          // getLogs();
        }
        return response;
      }, true);
    }
  };

  const handleProfileSelectionSave = async (selectedProfiles: FullProfile[]) => {
    setIsProfileSelectorOpen(false);
    if (foldersForQuickClean.length > 0 && selectedProfiles.length > 0) {
      handleActionWithLoading(async () => {
        const response = await window.api.organization.organizeWithSelectedProfiles(
          selectedProfiles,
          foldersForQuickClean
        );
        if (response.items && response.items > 0) {
          setLastLogId(undefined);
        }
        return response;
      }, true);
    }
  };

  async function montaMensagemPastas(folders: PathStats[] | string[]) {
    let folderNames = "";
    let stats: PathStats[] = folders as PathStats[];
    if (typeof folders[0] === "string") stats = await window.api.getStatsForPaths(folders as string[]);
    folderNames = stats.map((f, index) => `\n${++index} ${f.name}`).join("");

    return `Organizar ${folders.length} pasta(s):\n${folderNames}`;
  }
  const handleDefaultOrganization = async (paths: string[]) => {
    handleActionWithLoading(() => window.api.organization.defaultOrganization(paths), true);
    if (isTourActive() && getCurrentStepId() === "click-default-profile") {
      tourNext();
    }
  };
  async function showQuickOrganizationOptions(folderPaths: string[]) {
    const message = await montaMensagemPastas(folderPaths);
    showConfirm(
      {
        confirmBtnId: "btn-default",
        message,
        confirmText: "Usar Perfil Padrão",
        confirmBtnColor: "success",
      },
      async () => {
        await handleDefaultOrganization(folderPaths);
      },
      [
        {
          text: "Selecionar Regras",
          thirdButtonColor: "warning",
          action: () => {
            setFoldersForQuickClean(folderPaths);
            setIsRuleSelectorOpen(true);
          },
        },
        {
          text: "Selecionar Perfil",
          thirdButtonColor: "info",
          action: () => {
            setFoldersForQuickClean(folderPaths);
            setIsProfileSelectorOpen(true);
          },
        },
      ]
    );
  }

  function handleMessage<T>(response: DbResponse<T>) {
    let messageType: AlertColor = response.status ? "success" : "error";
    if (response.status && response.items === 0) messageType = "info";
    showMessage(response.message, messageType);
  }

  const handleDeleteAllLogs = async () => {
    showConfirm(
      {
        title: "ATENÇÃO!",
        message: "Esta ação apagará todos os logs e poderá demorar vários minutos, deseja prosseguir?",
        confirmBtnColor: "success",
        cancelBtnColor: "error",
      },
      async () => {
        await handleActionWithLoading(deleteAllLogs, true);
      }
    );
  };

  const handleDeleteLogById = async (logId: number) => {
    const response = await deleteLog(logId);
    const messageType = response.status ? "success" : "error";
    showMessage(response.message, messageType);
  };

  async function handleClickForceVerification() {
    handleActionWithLoading(window.api.organization.organizeAll, true);
  }

  const handleSubTitleProfiles = async () => {
    const result = await window.api.profile.getProfilesActiveInactiveCount();
    setProfilesLegend(result);
  };

  const HomePageCard = styled(GenericCard)(({ theme }) => ({
    width: "35rem",
    height: "11rem",
    backgroundColor: theme.palette.mode === "dark" ? "#1e2533" : "#f5f2ef",
    borderRadius: 8,
    border: theme.palette.mode === "light" ? "1px solid #e8e4e0" : "none",
  }));
  return (
    <ContentWrapper sx={{ minHeight: "95vh", display: "flex", justifyContent: "flex-start" }} id="home-page">
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <HomePageCard
          title="Forçar Verificação"
          subtitle="Verifica todas as pastas monitoradas imediatamente"
          icon={<Icon icon="vscode-icons:file-type-syncpack" width="45" height="45" />}
          onClick={handleClickForceVerification}
          iconSx={{ backgroundColor: "transparent" }}
        />
        <HomePageCard
          title="Status dos Perfis"
          subtitle={profilesLegend}
          icon={<Icon icon="fluent-color:person-16" width="45" height="45" />}
          onClick={() => navigate("/profiles")}
          iconSx={{ backgroundColor: "transparent" }}
        />

        <HomePageCard
          id="how-to-use-card"
          title="Como usar?"
          subtitle="Guia rápido de início"
          icon={<Icon icon="noto-v1:graduation-cap" width="45" height="45" />}
          iconSx={{ backgroundColor: "transparent" }}
          onClick={handleHowToUse}
        />

        <HomePageCard
          title="Ajudar o projeto"
          subtitle="Doe qualquer quantia para ajudar o avanço do projeto"
          icon={<Icon icon="streamline-ultimate-color:cash-payment-coin-dollar" width="45" height="45" />}
          onClick={() => setIsDonationPopupOpen(true)}
          iconSx={{ backgroundColor: "transparent" }}
        />
        <DonationPopup
          open={isDonationPopupOpen}
          onClose={() => {
            setIsDonationPopupOpen(false);
          }}
        />
      </Box>
      <FolderDropZone
        id="folder-drop-zone"
        onClick={handleSelectFolderClick}
        onItemsDropped={handleItemsDropped}
      />
      <ContentWrapper
        id="recent-activity"
        titleTagType="h3"
        sx={{ maxHeight: "52rem", borderRadius: 8 }}
        title="Atividade Recente"
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
              id="recent-activity-list"
              isButton
              btnDelete
              onClickDelete={handleDeleteLogById}
              onClickListItem={handleOpenDetails}
              lastItemRef={lastLogRef as RefObject<HTMLLIElement>}
              list={recentActivityList}
              sx={{
                "& .MuiListItemText-primary": {
                  fontSize: "1.8rem",
                },
                "& .MuiListItemText-secondary": {
                  fontSize: "3rem",
                },
              }}
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
      <Modal
        open={isProfileSelectorOpen}
        onClose={() => setIsProfileSelectorOpen(false)}
        sx={{ bgcolor: "background.paper", borderRadius: 8, width: "90vw", height: "90vh", margin: "auto" }}
      >
        <ProfileManagementView
          mode="selection"
          initialSelectedProfiles={undefined}
          onSelectionSave={handleProfileSelectionSave}
          onCancel={() => setIsProfileSelectorOpen(false)}
        />
      </Modal>
      <OrganizationLogPopup
        key={selectedLog?.id}
        log={selectedLog}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          if (isTourActive() && getCurrentStepId() === "close-organization-log") {
            setTimeout(() => {
              tourNext();
            }, 150);
          }
        }}
      />
      <Loading isLoading={isLoading} />
    </ContentWrapper>
  );
};

export default HomePage;
