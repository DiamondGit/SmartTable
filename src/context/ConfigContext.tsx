import { createContext } from "react";
import { SavedTableConfigListType, TableConfigType } from "../types/general";

interface ConfigContextType {
    readonly defaultTableConfig: TableConfigType | undefined;
    
    tableConfig: TableConfigType | undefined;
    setTableConfig: (newTableConfig: TableConfigType) => void;

    modalTableConfig: TableConfigType | undefined;
    setModalTableConfig: (newTableConfig: TableConfigType) => void;
    
    savedTableConfigList: SavedTableConfigListType;

    selectedSavedTableConfigId: number | null;
    
    hasLeftPin: boolean;
    hasRightPin: boolean;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export default ConfigContext;
