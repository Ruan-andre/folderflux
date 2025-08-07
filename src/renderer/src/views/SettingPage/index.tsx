import ContentWrapper from "../../components/ContentWrapper";
import GenericListItems from "../../components/GenericListItems";
import { useEffect, useState, useMemo } from "react";
import { SettingsSchema } from "~/src/db/schema";
import { useSnackbar } from "../../context/SnackBarContext";
import GenericListItemsType from "../../types/GenericListItemsType";

const SettingPage = () => {
  const { showMessage } = useSnackbar();

  const [settings, setSettings] = useState<SettingsSchema[]>([]);

  const generalSettingsList: GenericListItemsType[] = useMemo(() => {
    return settings
      .filter((s) => s.category === "general")
      .map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.description ?? "",
        active: s.isActive,
      }));
  }, [settings]);

  const appearanceSettingsList: GenericListItemsType[] = useMemo(() => {
    return settings
      .filter((s) => s.category === "appearance")
      .map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.description ?? "",
        active: s.isActive,
      }));
  }, [settings]);

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
      await window.api.settings.toggleSettingActive(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showMessage("Erro ao atualizar a configuração.", "error");
      setSettings(originalSettings);
    }
  };

  if (settings.length === 0) return null;

  return (
    <ContentWrapper title="Configurações">
      <ContentWrapper title="Geral" hr boxShadow="none" titleSize={20} gap="1rem" padding="1rem">
        <GenericListItems
          list={generalSettingsList}
          btnSwitch
          onToggle={handleToggle}
          isButton={false}
          borderBottom="1px solid rgba(245, 245, 245, 0.27)"
          listItemPadding="1.5rem"
        />
      </ContentWrapper>

      <ContentWrapper title="Aparência" hr boxShadow="none" titleSize={20} gap="1rem" padding="1rem">
        <GenericListItems
          list={appearanceSettingsList}
          btnSwitch
          onToggle={handleToggle}
          isButton={false}
          borderBottom="1px solid rgba(245, 245, 245, 0.27)"
          listItemPadding="1.5rem"
        />
      </ContentWrapper>
    </ContentWrapper>
  );
};

export default SettingPage;
