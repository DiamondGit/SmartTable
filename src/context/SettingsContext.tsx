import { createContext } from "react";

interface SettingsContextType {
    isLoading: boolean;
    isConfigEditable: boolean;
    setConfigEditable: React.Dispatch<React.SetStateAction<boolean>>;
    isUsingDefaultSettings: boolean;
    canAdd: boolean;
    isSavingSettings: boolean;
    isEditingSavedConfig: boolean;
    startSaveSettings: () => void;
    handleEditSavedSettings: () => void;
    handleDeleteSavedConfig: () => void;
    handleCancelSaveSettings: () => void;
    handleChangeSettingsName: (event: React.ChangeEvent<HTMLInputElement>) => void;
    currentSavedConfigName: string;
    settingsName: string;
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export default SettingsContext;
