import { useState, useEffect } from "react";
import StateContext from "../../context/StateContext";
import { SortOptions, Z_SortOptions } from "../../types/enums";
import { BodyColumnPin } from "../../types/general";

interface StateProviderType {
    children: React.ReactNode;
}

const StateProvider = ({ children }: StateProviderType) => {
    const [isSavedSettings, setSavedSettings] = useState(false);

    const [isConfigLoading, setConfigLoading] = useState(false);
    const [isDataLoading, setDataLoading] = useState(false);

    const [isConfigLoadingError, setConfigLoadingError] = useState(false);
    const [isDataLoadingError, setDataLoadingError] = useState(false);

    const [data, setData] = useState<any[]>([]);

    const [sortingColumn, setSortingColumn] = useState("id");
    const [sortingDirection, setSortingDirection] = useState<SortOptions>(Z_SortOptions.enum.ASC);

    const [searchValue, setSearchValue] = useState("");

    const [isFiltersFilled, setFiltersFilled] = useState(false);

    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const [columnPins, setColumnPins] = useState<BodyColumnPin[]>([]);

    const [tableHasLeftShadow, setTableHasLeftShadow] = useState(false);

    const [maxHeadingDepth, setMaxHeadingDepth] = useState(0);

    return (
        <StateContext.Provider
            value={{
                data,
                setData,

                isSavedSettings,
                setSavedSettings,

                isConfigLoadingError,
                setConfigLoadingError,

                isDataLoadingError,
                setDataLoadingError,

                isError: isConfigLoadingError || isDataLoadingError,

                isConfigLoading,
                setConfigLoading,

                isDataLoading,
                setDataLoading,

                isLoading: isConfigLoading || isDataLoading,

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
