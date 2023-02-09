import { createContext } from "react";

export interface PaginationContextType {
    currentPage: number;
    pageSize: number;
}

const PaginationContext = createContext<PaginationContextType>({} as PaginationContextType);

export default PaginationContext;
