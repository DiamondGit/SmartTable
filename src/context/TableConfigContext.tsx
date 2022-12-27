import { createContext } from "react";
import { SavedTableConfigType, TableConfigType } from "../types/general";

interface TableConfigContextType {
    readonly defaultTableConfig: TableConfigType;
    savedTableConfigs: SavedTableConfigType[];
    selectedSavedTableConfigId: number | null;
    setTableConfig: (newTableConfig: TableConfigType) => void;
    tableConfig: TableConfigType;
    setModalTableConfig: (newTableConfig: TableConfigType, isResetHard?: boolean) => void;
    modalTableConfig: TableConfigType;
}

const TableConfigContext = createContext<TableConfigContextType>({} as TableConfigContextType);

export default TableConfigContext;
