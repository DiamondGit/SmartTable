import { createContext } from "react";
import { TableUIType } from "../types/general";

const UIContext = createContext<TableUIType>({} as TableUIType);

export default UIContext;
