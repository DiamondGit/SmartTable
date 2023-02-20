import { useContext, useState } from "react";
import FilterContext from "../../context/FilterContext";
import PaginationContext from "../../context/PaginationContext";
import StateContext from "../../context/StateContext";
import { GeneralObject } from "../../types/general";

interface FilterProviderType {
    children: React.ReactNode;
}

const FilterProvider = ({ children }: FilterProviderType) => {
    const paginationContext = useContext(PaginationContext);
    const stateContext = useContext(StateContext);

    const [filterValues, setFilterValues] = useState<GeneralObject>({});
    const [modalFilterValues, setModalFilterValues] = useState(filterValues);

    const [filterFieldLists, setFilterFieldLists] = useState<{ [key: string]: any[] }>({});
    const [filterFieldLoadings, setFilterFieldLoadings] = useState<{ [key: string]: boolean }>({});

    return (
        <FilterContext.Provider
            value={{
                filterValues,
                setFilterValues,

                modalFilterValues,
                setModalFilterValues,

                hasFilters: JSON.stringify(filterValues) !== "{}",

                filterFieldLists,
                setFilterFieldLists,

                filterFieldLoadings,
                setFilterFieldLoadings,

                queryProps: {
                    currentPage: paginationContext.currentPage,
                    pageSize: paginationContext.pageSize,
                    filters: filterValues,
                    search: paginationContext.searchValue,
                    sortField: stateContext.sortingColumn,
                    sortDir: stateContext.sortingDirection,
                },
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export default FilterProvider;
