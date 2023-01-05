import { createContext } from "react";
import { TableSortOptions } from "../types/general";

interface TableStateContextType {
    isSavedSettings: boolean;
    setSavedSettings: React.Dispatch<React.SetStateAction<boolean>>;
    isModalTableConfigResetHard: boolean;
    setModalTableConfigResetHard: React.Dispatch<React.SetStateAction<boolean>>;
    isConfigLoadingError: boolean;
    isDataLoadingError: boolean;
    isConfigLoading: boolean;
    isDataLoading: boolean;
    sortingColumn: string;
    setSortingColumn: React.Dispatch<React.SetStateAction<string>>;
    sortingDirection: TableSortOptions;
    setSortingDirection: React.Dispatch<React.SetStateAction<TableSortOptions>>;
    actionCellWidth: number;
    setActionCellWidth: React.Dispatch<React.SetStateAction<number>>;
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    isFiltersFilled: boolean;
    setFiltersFilled: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableStateContext = createContext<TableStateContextType>({} as TableStateContextType);

export default TableStateContext;
