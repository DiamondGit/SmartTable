import { createContext, MouseEventHandler } from "react";
import { TableColumnType, TableColumnPin } from "../types/general";

interface TableHeadContextType {
    updateTableColumnPin: (tableColumnWidth: TableColumnPin) => void;
    handleClick: (dataIndex: string) => MouseEventHandler | undefined;
}

const TableHeadContext = createContext<TableHeadContextType>({} as TableHeadContextType);

export default TableHeadContext;
