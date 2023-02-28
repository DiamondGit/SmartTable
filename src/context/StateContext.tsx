import { createContext } from "react";
import { SortOptions } from "../types/enums";
import { ColumnPinType } from "../types/general";

interface StateContextType {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;

    isDefaultConfigLoadingError: boolean;
    setDefaultConfigLoadingError: React.Dispatch<React.SetStateAction<boolean>>;
    
    isSavedConfigsLoadingError: boolean;
    setSavedConfigsLoadingError: React.Dispatch<React.SetStateAction<boolean>>;

    isDefaultConfigLoading: boolean;
    setDefaultConfigLoading: React.Dispatch<React.SetStateAction<boolean>>;

    isSavedConfigsLoading: boolean;
    setSavedConfigsLoading: React.Dispatch<React.SetStateAction<boolean>>;

    sortingColumn: string;
    setSortingColumn: React.Dispatch<React.SetStateAction<string>>;

    sortingDirection: SortOptions;
    setSortingDirection: React.Dispatch<React.SetStateAction<SortOptions>>;

    isFiltersFilled: boolean;
    setFiltersFilled: React.Dispatch<React.SetStateAction<boolean>>;

    columnPins: ColumnPinType[];
    setColumnPins: React.Dispatch<React.SetStateAction<ColumnPinType[]>>;

    tableHasLeftShadow: boolean;
    setTableHasLeftShadow: React.Dispatch<React.SetStateAction<boolean>>;

    maxHeadingDepth: number;
    setMaxHeadingDepth: React.Dispatch<React.SetStateAction<number>>;
}

const StateContext = createContext<StateContextType>({} as StateContextType);

export default StateContext;
