import { createContext, MouseEventHandler } from "react";
import { TableColumnWidth } from "../components/Table/Head";
import { TableColumnType, TablePinOptions } from "../types/general";

interface TableHeadContextType {
    updateTableColumnWidth: (tableColumnWidth: TableColumnWidth) => void;
    getPinSide: (pin: TablePinOptions) => string;
    getPinOffset: (pin: TablePinOptions, order: number) => number;
    getColumnClasses: (column: TableColumnType, isPinned: boolean) => string[];
    handleClick: (dataIndex: string) => MouseEventHandler | undefined;
}

const TableHeadContext = createContext<TableHeadContextType>({} as TableHeadContextType);

export default TableHeadContext;
