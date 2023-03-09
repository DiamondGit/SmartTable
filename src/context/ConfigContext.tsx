import { createContext } from "react";
import { ColumnType, SavedTableConfigType, TableConfigType } from "../types/general";

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

    requestDefaultConfig: () => void;
    requestSavedConfigs: (defaultConfig?: TableConfigType | undefined) => void;

    getSavedConfigById: (configId: number | undefined) => SavedTableConfigType | undefined;

    hasLeftPin: boolean;
    hasRightPin: boolean;

    filterConfig: ColumnType[];
    modalConfig: ColumnType[];

    hasActionColumn: boolean;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export default ConfigContext;
