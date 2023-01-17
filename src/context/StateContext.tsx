import { createContext } from "react";
import { TableColumnPin, TableSortOptions } from "../types/general";

interface StateContextType {
    data: any[];
    setData: React.Dispatch<React.SetStateAction<any[]>>;

    isSavedSettings: boolean;
    setSavedSettings: React.Dispatch<React.SetStateAction<boolean>>;

    isConfigLoadingError: boolean;
    setConfigLoadingError: React.Dispatch<React.SetStateAction<boolean>>;

    isDataLoadingError: boolean;
    setDataLoadingError: React.Dispatch<React.SetStateAction<boolean>>;

    isError: boolean;

    isConfigLoading: boolean;
    setConfigLoading: React.Dispatch<React.SetStateAction<boolean>>;

    isDataLoading: boolean;
    setDataLoading: React.Dispatch<React.SetStateAction<boolean>>;

    isLoading: boolean;

    sortingColumn: string;
    setSortingColumn: React.Dispatch<React.SetStateAction<string>>;

    sortingDirection: TableSortOptions;
    setSortingDirection: React.Dispatch<React.SetStateAction<TableSortOptions>>;

    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;

    isFiltersFilled: boolean;
    setFiltersFilled: React.Dispatch<React.SetStateAction<boolean>>;

    selectedRows: number[];
    setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;

    tableColumnPins: TableColumnPin[];
    setTableColumnPins: React.Dispatch<React.SetStateAction<TableColumnPin[]>>;

    tableHasLeftShadow: boolean;
    setTableHasLeftShadow: React.Dispatch<React.SetStateAction<boolean>>;
}

const StateContext = createContext<StateContextType>({} as StateContextType);

export default StateContext;
