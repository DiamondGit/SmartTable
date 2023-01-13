import { useState } from "react";
import StateContext from "../../context/StateContext";
import { TableSortOptions, Z_TableSortOptions } from "../../types/general";

interface StateWrapperType {
    children: React.ReactNode;
}

const StateWrapper = ({ children }: StateWrapperType) => {
    const [isSavedSettings, setSavedSettings] = useState(false);

    const [isConfigLoading, setConfigLoading] = useState(false);
    const [isDataLoading, setDataLoading] = useState(false);

    const [isConfigLoadingError, setConfigLoadingError] = useState(false);
    const [isDataLoadingError, setDataLoadingError] = useState(false);

    const [data, setData] = useState<any[]>([]);

    const [sortingColumn, setSortingColumn] = useState("id");
    const [sortingDirection, setSortingDirection] = useState<TableSortOptions>(Z_TableSortOptions.enum.ASC);

    const [actionCellWidth, setActionCellWidth] = useState<number>(0);

    const [searchValue, setSearchValue] = useState("");

    const [isFiltersFilled, setFiltersFilled] = useState(false);

    return (
        <StateContext.Provider
            value={{
                data: data,
                setData: setData,

                isSavedSettings: isSavedSettings,
                setSavedSettings: setSavedSettings,

                isConfigLoadingError: isConfigLoadingError,
                setConfigLoadingError: setConfigLoadingError,

                isDataLoadingError: isDataLoadingError,
                setDataLoadingError: setDataLoadingError,

                isError: isConfigLoadingError || isDataLoadingError,

                isConfigLoading: isConfigLoading,
                setConfigLoading: setConfigLoading,

                isDataLoading: isDataLoading,
                setDataLoading: setDataLoading,

                isLoading: isConfigLoading || isDataLoading,

                sortingColumn: sortingColumn,
                setSortingColumn: setSortingColumn,

                sortingDirection: sortingDirection,
                setSortingDirection: setSortingDirection,

                actionCellWidth: actionCellWidth,
                setActionCellWidth: setActionCellWidth,

                searchValue: searchValue,
                setSearchValue: setSearchValue,

                isFiltersFilled: isFiltersFilled,
                setFiltersFilled: setFiltersFilled,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export default StateWrapper;
