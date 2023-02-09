import { createContext, MouseEventHandler } from "react";
import { ColumnPinType } from "../types/general";

interface TableHeadContextType {
    updateColumnPin: (columnPin: ColumnPinType) => void;
    addOrReplaceColumnPin: (columnPin: ColumnPinType) => void;
    handleClick: (dataIndex: string) => MouseEventHandler;
}

const TableHeadContext = createContext<TableHeadContextType>({} as TableHeadContextType);

export default TableHeadContext;
