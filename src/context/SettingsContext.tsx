import { createContext } from "react";

interface SettingsContextType {
    isLoading: boolean;
    isConfigEditable: boolean;
    setConfigEditable: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export default SettingsContext;
