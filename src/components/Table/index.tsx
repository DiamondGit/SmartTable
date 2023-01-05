import { ConfigProvider as AntdConfigProvider } from "antd";
import { useEffect, useState } from "react";
import TableConfigContext from "../../context/TableConfigContext";
import TableStateContext from "../../context/TableStateContext";
import TableUIContext from "../../context/TableUIContext";
import { getTableConfig, getTableData } from "../../controllers/controllers";
import { useScrollWithShadow } from "../../functions/useScrollWithShadow";
import "../../styles/global.scss";
import {
    SavedTableConfigType,
    TableConfigSchema,
    TableConfigType,
    TableFilterHighlightType,
    TableFilterItemType,
    TableInitializationType,
    TableSortOptions,
    TableUIType,
    Z_FilterHighlights,
    Z_TableCellSizes,
    Z_TableSortOptions,
} from "../../types/general";
import Aligner from "../Aligner";
import SettingsModal from "../Modal/SettingsModal";
import PaginationWrapper from "../PaginationWrapper";
import SkeletonFiller from "./SkeletonFiller";
import style from "./Table.module.scss";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import TopBar from "./TopBar";
import ruRU from "antd/locale/ru_RU";
import FilterModal from "../Modal/FilterModal";
import TableFilterContext from "../../context/TableFilterContext";

interface TableStartingType extends TableInitializationType {
    UI: TableUIType;
}

const Table = ({ tableTitle, tableName, userId, loadingConfig, paginationConfig, UI }: TableStartingType) => {
    const [isSavedSettings, setSavedSettings] = useState(false);

    const [isConfigLoading, setConfigLoading] = useState(false);
    const [isDataLoading, setDataLoading] = useState(false);
    const isLoading = isConfigLoading || isDataLoading;

    const [isConfigLoadingError, setConfigLoadingError] = useState(false);
    const [isDataLoadingError, setDataLoadingError] = useState(false);
    const isError = isConfigLoadingError || isDataLoadingError;

    const [defaultTableConfig, setDefaultTableConfig] = useState<TableConfigType>();
    const [tableConfig, setTableConfig] = useState<TableConfigType>();
    const [modalTableConfig, setModalTableConfig] = useState<TableConfigType>();
    const [savedTableConfigs, setSavedTableConfigs] = useState<SavedTableConfigType[]>([]);

    const [isModalTableConfigResetHard, setModalTableConfigResetHard] = useState(false);

    const [data, setData] = useState<any[]>([]);

    const [isFullscreen, setFullscreen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);

    const isConfigLoaded = !isConfigLoading && !isConfigLoadingError && tableConfig;
    const defaultColumnCount = loadingConfig?.columnCount || 4;

    const [sortingColumn, setSortingColumn] = useState("id");
    const [sortingDirection, setSortingDirection] = useState<TableSortOptions>(Z_TableSortOptions.enum.ASC);

    const [actionCellWidth, setActionCellWidth] = useState<number>(0);

    const [searchValue, setSearchValue] = useState("");

    const { scrollContainer, boxShadowClasses, onScrollHandler, doShadow } = useScrollWithShadow();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(0);

    const [filterHighlight, setFilterHighlight] = useState<TableFilterHighlightType>({
        type: Z_FilterHighlights.enum.HIGHLIGHT,
        filterIds: [],
    });
    const [filtersList, setFiltersList] = useState<TableFilterItemType[]>([]);
    const [modalFiltersList, setModalFiltersList] = useState<TableFilterItemType[]>(filtersList);
    const [modalFiltersChangesList, setModalFiltersChangesList] = useState<TableFilterItemType[]>(filtersList);

    const [isFiltersFilled, setFiltersFilled] = useState(false);

    const computedLoadingConfig = {
        columnCount:
            isDataLoading && isConfigLoaded
                ? tableConfig?.table.filter((column) => column.visible).length || defaultColumnCount
                : defaultColumnCount,
        rowCount: loadingConfig?.rowCount || 5,
        noFuncBtnsLeft: loadingConfig?.noFuncBtnsLeft || false,
        noFuncBtnsRight: loadingConfig?.noFuncBtnsRight || false,
    };
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const fetchConfig = () => {
        setConfigLoading(true);
        setConfigLoadingError(false);
        getTableConfig(tableName, userId)
            .then((res) => {
                const _defaultTableConfig_ = TableConfigSchema.parse(res.defaultTableConfig);
                setDefaultTableConfig(_defaultTableConfig_);

                const _savedTableConfigs_ = res.savedTableConfigs || [];
                setSavedTableConfigs(_savedTableConfigs_);

                const _recentTableConfig_ = _savedTableConfigs_.find((savedTableConfig) => savedTableConfig.isRecent);
                const computedTableConfig = _recentTableConfig_
                    ? TableConfigSchema.parse(_recentTableConfig_)
                    : _defaultTableConfig_;
                setTableConfig(computedTableConfig);
                setModalTableConfig(computedTableConfig);

                console.log("--- Success CONFIG ---");
            })
            .catch((error) => {
                console.log("--- Error CONFIG ---");
                setConfigLoadingError(true);
            })
            .finally(() => {
                setConfigLoading(false);
            });
    };

    const fetchData = () => {
        setDataLoading(true);
        setDataLoadingError(false);
        getTableData(tableName, userId)
            .then((res) => {
                setData(res);
                console.log("--- Success DATA ---");
            })
            .catch((error) => {
                console.log("--- Error DATA ---");
                setDataLoadingError(true);
            })
            .finally(() => {
                setDataLoading(false);
            });
    };

    useEffect(() => {
        fetchConfig();
        fetchData();
    }, []);

    const toggleFullscreen = () => {
        setFullscreen((prevState) => !prevState);
    };

    const openSettingsModal = () => {
        setSettingsModalOpen(true);
        setModalTableConfig(tableConfig);
    };

    const openFilterModal = () => {
        setFilterModalOpen(true);
    };

    const handleChangePage = (newPage: number) => {
        if (paginationConfig?.perPageFetch) {
            console.log("--- FETCH NEW DATA ---");
        }
        setCurrentPage(newPage);
    };

    const fullscreenContainerClasses = [style.fullscreenContainer];
    if (isFullscreen) fullscreenContainerClasses.push(style.active);

    const tableContainerClasses = [
        style.tableContainer,
        style[`size_${tableConfig?.cellSize || Z_TableCellSizes.enum.MEDIUM}`],
    ];

    const tableClasses = [style.table];
    if (isLoading) tableClasses.push(style.loading);

    useEffect(() => {
        doShadow();
    }, [tableConfig, data]);

    const setAndCompareTempTableConfig = (newTableConfig: TableConfigType, isResetHard = false) => {
        setModalTableConfig(newTableConfig);
        setModalTableConfigResetHard(isResetHard);
    };

    const setAndCompareTableConfig = (newTableConfig: TableConfigType) => {
        setTableConfig(newTableConfig);
    };

    const slicedDataStartIndex = (currentPage - 1) * pageSize;

    return (
        <TableConfigContext.Provider
            value={{
                defaultTableConfig: defaultTableConfig,
                savedTableConfigs: savedTableConfigs,
                selectedSavedTableConfigId: null,

                tableConfig: tableConfig,
                setTableConfig: setAndCompareTableConfig,

                modalTableConfig: modalTableConfig,
                setModalTableConfig: setAndCompareTempTableConfig,
            }}
        >
            <TableFilterContext.Provider
                value={{
                    filtersList: filtersList,
                    setFiltersList: setFiltersList,

                    modalFiltersList: modalFiltersList,
                    setModalFiltersList: setModalFiltersList,

                    modalFiltersChangesList: modalFiltersChangesList,
                    setModalFiltersChangesList: setModalFiltersChangesList,

                    filterHighlight: filterHighlight,
                    setFilterHighlight: setFilterHighlight,
                }}
            >
                <TableStateContext.Provider
                    value={{
                        isModalTableConfigResetHard: isModalTableConfigResetHard,
                        setModalTableConfigResetHard: setModalTableConfigResetHard,

                        isSavedSettings: isSavedSettings,
                        setSavedSettings: setSavedSettings,

                        isConfigLoadingError: isConfigLoadingError,
                        isDataLoadingError: isDataLoadingError,

                        isConfigLoading: isConfigLoading,
                        isDataLoading: isDataLoading,

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
                    <TableUIContext.Provider value={UI}>
                        <AntdConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: "#223c60",
                                },
                            }}
                            locale={ruRU}
                        >
                            <div className={fullscreenContainerClasses.join(" ")}>
                                <div className={tableContainerClasses.join(" ")}>
                                    <SettingsModal
                                        open={isSettingsModalOpen}
                                        setOpen={setSettingsModalOpen}
                                        tableTitle={tableTitle}
                                    />
                                    <FilterModal
                                        open={isFilterModalOpen}
                                        setOpen={setFilterModalOpen}
                                        tableTitle={tableTitle}
                                    />
                                    <TopBar
                                        title={tableTitle}
                                        isConfigLoading={isConfigLoading}
                                        isDataLoading={isDataLoading}
                                        isError={isError}
                                        isFullscreen={isFullscreen}
                                        computedLoadingConfig={computedLoadingConfig}
                                        toggleFullscreen={toggleFullscreen}
                                        openSettingsModal={openSettingsModal}
                                        openFilterModal={openFilterModal}
                                    />
                                    <PaginationWrapper
                                        total={data.length}
                                        current={currentPage}
                                        handlePageChange={handleChangePage}
                                        pageSize={pageSize}
                                        setPageSize={setPageSize}
                                        paginationConfig={paginationConfig}
                                        disabled={isLoading}
                                        openFilterModal={openFilterModal}
                                    >
                                        <div
                                            className={boxShadowClasses
                                                .map((boxShadowClass) => style[boxShadowClass])
                                                .join(" ")}
                                        >
                                            <div
                                                ref={scrollContainer}
                                                style={{ overflowX: "auto" }}
                                                onScroll={onScrollHandler}
                                            >
                                                <table className={tableClasses.join(" ")}>
                                                    {(!isError || isConfigLoading) && (
                                                        <thead>
                                                            <tr>
                                                                {!isConfigLoading ? (
                                                                    <TableHead tableConfig={tableConfig} />
                                                                ) : (
                                                                    <SkeletonFiller
                                                                        columnCount={computedLoadingConfig.columnCount}
                                                                        isHeading
                                                                    />
                                                                )}
                                                            </tr>
                                                        </thead>
                                                    )}
                                                    {!isError || isConfigLoading ? (
                                                        <tbody>
                                                            {!isLoading ? (
                                                                <TableBody
                                                                    data={
                                                                        paginationConfig?.perPageFetch
                                                                            ? data
                                                                            : data.slice(
                                                                                  slicedDataStartIndex,
                                                                                  slicedDataStartIndex + pageSize
                                                                              )
                                                                    }
                                                                    selectedRows={selectedRows}
                                                                    setSelectedRows={setSelectedRows}
                                                                />
                                                            ) : (
                                                                <SkeletonFiller
                                                                    columnCount={computedLoadingConfig.columnCount}
                                                                    rowCount={computedLoadingConfig.rowCount}
                                                                />
                                                            )}
                                                        </tbody>
                                                    ) : (
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding: 0,
                                                                    }}
                                                                >
                                                                    <Aligner className={style.loadingError}>
                                                                        {isConfigLoadingError
                                                                            ? isDataLoadingError
                                                                                ? "ОШИБКА ТАБЛИЦЫ И ДАННЫХ"
                                                                                : "ОШИБКА ТАБЛИЦЫ"
                                                                            : isDataLoadingError && "ОШИБКА ДАННЫХ"}
                                                                    </Aligner>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    )}
                                                </table>
                                            </div>
                                        </div>
                                    </PaginationWrapper>
                                </div>
                            </div>
                        </AntdConfigProvider>
                    </TableUIContext.Provider>
                </TableStateContext.Provider>
            </TableFilterContext.Provider>
        </TableConfigContext.Provider>
    );
};

export default Table;
