import ContentWrapper from "../../components/ContentWrapper";
import GenericListItems from "../../components/GenericListItems";
import { useEffect, useState } from "react";
import { SettingsSchema } from "~/src/db/schema";
import { useSnackbar } from "../../context/SnackBarContext";
import GenericListItemsType from "../../types/GenericListItemsType";
import { useTheme } from "../../context/ThemeContext";
import { styled } from "@mui/material";

const SettingWrapper = styled(ContentWrapper)({ boxShadow: "none", gap: "1rem", padding: "1rem" });
const SettingPage = () => {
  const { showMessage } = useSnackbar();
  const { toggleTheme } = useTheme();

  const [settings, setSettings] = useState<SettingsSchema[]>([]);

  const generalSettingsList: GenericListItemsType[] = settings
    .filter((s) => s.category === "general")
    .map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.description ?? "",
      active: s.isActive,
    }));

  const appearanceSettingsList: GenericListItemsType[] = settings
    .filter((s) => s.category === "appearance")
    .map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.description ?? "",
      active: s.isActive,
    }));

  useEffect(() => {
    async function fetchData() {
      const response = await window.api.settings.getSettings();
      setSettings(response);
    }
    fetchData();
  }, []);

  const handleToggle = async (id: number) => {
    const originalSettings = [...settings];
    setSettings((currentSettings) =>
      currentSettings.map((setting) =>
        setting.id === id ? { ...setting, isActive: !setting.isActive } : setting
      )
    );

    try {
      const selectedSetting = originalSettings.find((s) => s.id === id);
      switch (selectedSetting?.type) {
        case "startWithOS":
          await window.api.settings.toggleSettingActive(id, "startWithOS");
          break;
        case "darkMode":
          toggleTheme();
          await window.api.settings.toggleSettingActive(id);
          break;
        default:
          await window.api.settings.toggleSettingActive(id);
          break;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showMessage("Erro ao atualizar a configuração.", "error");
      setSettings(originalSettings);
    }
  };

  if (settings.length === 0) return null;

  return (
    <ContentWrapper title="Configurações">
      <SettingWrapper
        sx={{ boxShadow: "none", gap: "1rem", padding: "1rem" }}
        title="Geral"
        hr
        titleTagType="h3"
      >
        <GenericListItems list={generalSettingsList} btnSwitch onToggle={handleToggle} isButton={false} />
      </SettingWrapper>
      <SettingWrapper title="Aparência" hr titleTagType="h3">
        <GenericListItems list={appearanceSettingsList} btnSwitch onToggle={handleToggle} isButton={false} />
      </SettingWrapper>
    </ContentWrapper>
  );
};

export default SettingPage;
