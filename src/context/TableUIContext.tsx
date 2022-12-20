import { createContext } from "react";
import { TableUIType } from "../types/general";

const TableUIContext = createContext<TableUIType>({} as TableUIType);

export default TableUIContext;
