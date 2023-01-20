import { createContext, MouseEventHandler } from "react";
import { BodyColumnPin } from "../types/general";

interface TableHeadContextType {
    updateColumnPin: (columnPin: BodyColumnPin) => void;
    handleClick: (dataIndex: string) => MouseEventHandler;
}

const TableHeadContext = createContext<TableHeadContextType>({} as TableHeadContextType);

export default TableHeadContext;
