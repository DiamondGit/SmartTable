import { createContext } from "react";
import { SavedTableConfigType, TableConfigType } from "../types/general";

interface TableConfigContextType {
    readonly defaultTableConfig: TableConfigType;
    savedTableConfigs: SavedTableConfigType[];
    selectedSavedTableConfigId: number | null;
    setTableConfig: React.Dispatch<React.SetStateAction<TableConfigType>>;
    tableConfig: TableConfigType;
}

const TableConfigContext = createContext<TableConfigContextType>({} as TableConfigContextType);

export default TableConfigContext;
