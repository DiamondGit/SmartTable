import { createContext } from "react";

interface TableStateContextType {
    isSettingsChanged: boolean;
    setSettingsChanged: React.Dispatch<React.SetStateAction<boolean>>;
    isSavedSettings: boolean;
    setSavedSettings: React.Dispatch<React.SetStateAction<boolean>>;
    checkChanges: () => void;
    isConfigLoadingError: boolean;
    isDataLoadingError: boolean;
    isConfigLoading: boolean;
    isDataLoading: boolean;
}

const TableStateContext = createContext<TableStateContextType>({} as TableStateContextType);

export default TableStateContext;
