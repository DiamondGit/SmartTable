import { createContext } from "react";
import { TableInitializationType } from "../types/general";

const PropsContext = createContext<TableInitializationType>({} as TableInitializationType);

export default PropsContext;
