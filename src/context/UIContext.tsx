import { createContext } from "react";
import { TableUIType } from "../types/UI";

const UIContext = createContext<TableUIType>({} as TableUIType);

export default UIContext;
