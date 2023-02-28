import { createContext } from "react";

export interface PaginationContextType {
    computedPageSizeOptions: number[];

    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;

    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationContext = createContext<PaginationContextType>({} as PaginationContextType);

export default PaginationContext;
