import { useContext, useState } from "react";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { SortOptions, Z_SortOptions } from "../../types/enums";
import { ColumnPinType } from "../../types/general";

interface StateProviderType {
    children: React.ReactNode;
}

const StateProvider = ({ children }: StateProviderType) => {
    const { hasAccessTo } = useContext(PropsContext);

    const [isDefaultConfigLoading, setDefaultConfigLoading] = useState(false);
    const [isSavedConfigsLoading, setSavedConfigsLoading] = useState(false);

    const [isDefaultConfigLoadingError, setDefaultConfigLoadingError] = useState(false);
    const [isSavedConfigsLoadingError, setSavedConfigsLoadingError] = useState(false);

    const [sortingColumn, setSortingColumn] = useState("id");
    const [sortingDirection, setSortingDirection] = useState<SortOptions>(Z_SortOptions.enum.DESC);

    const [isFiltersFilled, setFiltersFilled] = useState(false);

    const [columnPins, setColumnPins] = useState<ColumnPinType[]>([]);

    const [tableHasLeftShadow, setTableHasLeftShadow] = useState(false);

    const [maxHeadingDepth, setMaxHeadingDepth] = useState(0);

    return (
        <StateContext.Provider
            value={{
                canCreate: hasAccessTo?.create || false,
                canUpdate: hasAccessTo?.update || false,
                canDelete: hasAccessTo?.delete || false,

                isDefaultConfigLoadingError,
                setDefaultConfigLoadingError,

                isSavedConfigsLoadingError,
                setSavedConfigsLoadingError,

                isSavedConfigsLoading,
                setSavedConfigsLoading,

                isDefaultConfigLoading,
                setDefaultConfigLoading,

                sortingColumn,
                setSortingColumn,

                sortingDirection,
                setSortingDirection,

                isFiltersFilled,
                setFiltersFilled,

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
