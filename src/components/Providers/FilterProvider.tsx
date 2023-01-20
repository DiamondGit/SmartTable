import { useState } from "react";
import FilterContext from "../../context/FilterContext";
import { TableFilterHighlightType, Z_FilterHighlights } from "../../types/enums";
import { SavedTableFilterItemType, TableFilterItemType } from "../../types/general";

interface FilterProviderType {
    children: React.ReactNode;
}

const FilterProvider = ({ children }: FilterProviderType) => {
    const [filterHighlight, setFilterHighlight] = useState<TableFilterHighlightType>({
        type: Z_FilterHighlights.enum.HIGHLIGHT,
        filterIds: [],
    });
    const [filtersList, setFiltersList] = useState<TableFilterItemType[]>([]);
    const [modalFiltersList, setModalFiltersList] = useState<TableFilterItemType[]>(filtersList);
    const [modalFiltersChangesList, setModalFiltersChangesList] = useState<TableFilterItemType[]>(filtersList);
    const [savedTableFilters, setSavedTableFilters] = useState<SavedTableFilterItemType[]>([]);

    return (
        <FilterContext.Provider
            value={{
                filtersList,
                setFiltersList,

                modalFiltersList,
                setModalFiltersList,

                modalFiltersChangesList,
                setModalFiltersChangesList,

                filterHighlight,
                setFilterHighlight,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export default FilterProvider;
