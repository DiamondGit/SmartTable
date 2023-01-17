import { createContext } from "react";

interface TableBodyContextType {
    dataRow: any;
    index: number;
}

const TableBodyContext = createContext<TableBodyContextType>({} as TableBodyContextType);

export default TableBodyContext;
