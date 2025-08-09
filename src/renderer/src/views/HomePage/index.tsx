import React, { useState } from "react";
import { Modal } from "@mui/material";
import ContentWrapper from "../../components/ContentWrapper";
import FolderDropZone from "../../components/FolderDropZone";
import GenericCard from "../../components/GenericCard";
import GenericListItems from "../../components/GenericListItems";
import Icon from "../../assets/icons/index";
import RuleManagementView from "../RuleManagementView";
import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import { FullRule } from "~/src/shared/types/RuleWithDetails";
import { PathStats } from "~/src/shared/types/pathStatsType";

const HomePage = () => {
  const { showConfirm } = useConfirmDialog();
  const [isRuleSelectorOpen, setIsRuleSelectorOpen] = useState<boolean>(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  const handleItemsDropped = async (paths: string[], callback?: () => void) => {
    if (!paths || paths.length === 0) return;

    const stats = await window.api.getStatsForPaths(paths);
    const folders = stats.filter((s) => s.isDirectory);

    if (folders.length === 0) {
      if (callback) callback();
      return;
    }
    const folderPaths = folders.map((f) => f.path);
    showConfirm(
      {
        message: await montaMensagemPastas(folders),
        confirmText: "Perfil Padrão",
        thirdButton: { text: "Selecionar Regras" },
        confirmBtnColor: "success",
      },
      async () => {
        await window.api.organization.defaultOrganization(folderPaths);
      },
      async () => {
        setSelectedFolders(folderPaths);
        setIsRuleSelectorOpen(true);
      }
    );
  };

  const handleClickSelectFolder = async () => {
    const response = await window.api.dialog.selectMultipleDirectories();
    if (response && response.length > 0) {
      showConfirm(
        {
          message: await montaMensagemPastas(response),
          confirmText: "Perfil Padrão",
          thirdButton: { text: "Selecionar Regras" },
          confirmBtnColor: "success",
        },
        async () => {
          if (response) await window.api.organization.defaultOrganization(response);
        },
        async () => {
          setSelectedFolders(response);
          setIsRuleSelectorOpen(true);
        }
      );
    }
  };

  const handleRuleSelectionSave = async (selectedRules: FullRule[]) => {
    if (selectedFolders && selectedRules.length > 0) {
      await window.api.organization.organizeWithSelectedRules(selectedRules, selectedFolders);
    }

    setIsRuleSelectorOpen(false);
  };

  async function montaMensagemPastas(folders: PathStats[] | string[]) {
    let folderNames = "";
    let stats: PathStats[] = [];
    if (typeof folders[0] === "string") stats = await window.api.getStatsForPaths(folders as string[]);
    folderNames = stats.map((f, index) => `\n${++index} ${f.name}`).join("");

    return `Organizar ${folders.length} pasta(s):\n${folderNames}`;
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

      <ContentWrapper title="Atividade Recente" hr>
        <GenericListItems list={[]} />
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
    </ContentWrapper>
  );
};

export default HomePage;
