import { createContext } from "react";
import { SavedTableConfigType, TableConfigType } from "../types/general";

interface ConfigContextType {
    readonly defaultTableConfig: TableConfigType | undefined;
    
    tableConfig: TableConfigType | undefined;
    setTableConfig: (newTableConfig: TableConfigType) => void;

    modalTableConfig: TableConfigType | undefined;
    setModalTableConfig: (newTableConfig: TableConfigType) => void;
    
    savedTableConfigs: SavedTableConfigType[];

    selectedSavedConfigId: number | undefined;
    setSelectedSavedConfigId: React.Dispatch<React.SetStateAction<number | undefined>>;

    modalSelectedSavedConfigId: number | undefined;
    setModalSelectedSavedConfigId: React.Dispatch<React.SetStateAction<number | undefined>>;

    selectedSavedTableConfigId: number | null;

    requestSavedConfigs: (defaultConfig?: TableConfigType | undefined) => void;

    getSavedConfigById: (configId: number | undefined) => SavedTableConfigType | undefined;
    
    hasLeftPin: boolean;
    hasRightPin: boolean;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export default ConfigContext;
