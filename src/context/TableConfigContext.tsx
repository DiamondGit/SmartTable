import { createContext } from "react";
import { TableConfigType } from "../types/general";

interface TableConfigContextType {
    tableConfig: TableConfigType;
    setTableConfig: React.Dispatch<React.SetStateAction<TableConfigType>>;
}

const TableConfigContext = createContext<TableConfigContextType>({} as TableConfigContextType);

export default TableConfigContext;
