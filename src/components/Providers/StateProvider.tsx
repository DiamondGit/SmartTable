import { useState, useContext } from "react";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { SortOptions, Z_SortOptions } from "../../types/enums";
import { ColumnPinType } from "../../types/general";

interface StateProviderType {
    children: React.ReactNode;
}

const StateProvider = ({ children }: StateProviderType) => {
    const propsContext = useContext(PropsContext);

    const [isSavedSettings, setSavedSettings] = useState(false);

    const [isDefaultConfigLoading, setDefaultConfigLoading] = useState(false);
    const [isSavedConfigsLoading, setSavedConfigsLoading] = useState(false);

    const [isDefaultConfigLoadingError, setDefaultConfigLoadingError] = useState(false);
    const [isSavedConfigsLoadingError, setSavedConfigsLoadingError] = useState(false);

    const [sortingColumn, setSortingColumn] = useState("id");
    const [sortingDirection, setSortingDirection] = useState<SortOptions>(Z_SortOptions.enum.ASC);

    const [searchValue, setSearchValue] = useState("");

    const [isFiltersFilled, setFiltersFilled] = useState(false);

    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const [columnPins, setColumnPins] = useState<ColumnPinType[]>([]);

    const [tableHasLeftShadow, setTableHasLeftShadow] = useState(false);

    const [maxHeadingDepth, setMaxHeadingDepth] = useState(0);

    return (
        <StateContext.Provider
            value={{
                isSavedSettings,
                setSavedSettings,

                isDefaultConfigLoadingError,
                setDefaultConfigLoadingError,

                isSavedConfigsLoadingError,
                setSavedConfigsLoadingError,

                isSavedConfigsLoading,
                setSavedConfigsLoading,

                isError: isDefaultConfigLoadingError || isSavedConfigsLoadingError || propsContext.isDataError || false,

                isDefaultConfigLoading,
                setDefaultConfigLoading,

                isLoading: isDefaultConfigLoading || isSavedConfigsLoading || propsContext.isDataLoading || false,

                sortingColumn,
                setSortingColumn,

                sortingDirection,
                setSortingDirection,

                searchValue,
                setSearchValue,

                isFiltersFilled,
                setFiltersFilled,

                selectedRows,
                setSelectedRows,

                columnPins,
                setColumnPins,

                tableHasLeftShadow,
                setTableHasLeftShadow,

                maxHeadingDepth,
                setMaxHeadingDepth,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export default StateProvider;
