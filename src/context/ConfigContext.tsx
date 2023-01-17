import { createContext } from "react";
import { SavedTableConfigType, TableConfigType } from "../types/general";

interface ConfigContextType {
    readonly defaultTableConfig: TableConfigType;
    savedTableConfigs: SavedTableConfigType[];
    selectedSavedTableConfigId: number | null;
    setTableConfig: (newTableConfig: TableConfigType) => void;
    tableConfig: TableConfigType;
    setModalTableConfig: (newTableConfig: TableConfigType, isResetHard?: boolean) => void;
    modalTableConfig: TableConfigType;
    hasLeftPin: boolean;
    hasRightPin: boolean;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export default ConfigContext;
