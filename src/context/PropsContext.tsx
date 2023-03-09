import { createContext } from "react";
import { PropsContextType } from "../types/general";

const PropsContext = createContext<PropsContextType>({} as PropsContextType);

export default PropsContext;
