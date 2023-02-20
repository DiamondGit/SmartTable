import { createContext } from "react";
import { GeneralObject } from "../types/general";

interface FilterContextType {
    filterValues: GeneralObject;
    setFilterValues: React.Dispatch<React.SetStateAction<GeneralObject>>;
    modalFilterValues: GeneralObject;
    setModalFilterValues: React.Dispatch<React.SetStateAction<GeneralObject>>;
    hasFilters: boolean;
    filterFieldLists: {
        [key: string]: any[];
    };
    setFilterFieldLists: React.Dispatch<
        React.SetStateAction<{
            [key: string]: any[];
        }>
    >;
    filterFieldLoadings: {
        [key: string]: boolean;
    };
    setFilterFieldLoadings: React.Dispatch<
        React.SetStateAction<{
            [key: string]: boolean;
        }>
    >;
    queryProps: {
        currentPage: number;
        pageSize: number;
        filters: GeneralObject;
        search: string;
        sortField: string;
        sortDir: string;
    };
}

const FilterContext = createContext<FilterContextType>({} as FilterContextType);

export default FilterContext;
