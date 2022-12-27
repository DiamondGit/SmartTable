import { useEffect, useState, useRef } from "react";
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
    TableInitializationType,
    TableSortOptions,
    TableUIType,
    Z_TableCellSizes,
    Z_TableSortOptions,
} from "../../types/general";
import Aligner from "../Aligner";
import SettingsModal from "../Modal/SettingsModal";
import SkeletonFiller from "./SkeletonFiller";
import style from "./Table.module.scss";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import TopBar from "./TopBar";

interface TableStartingType extends TableInitializationType {
    UI: TableUIType;
}

const Table = ({ tableTitle, tableName, userId, loadingConfig, UI }: TableStartingType) => {
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

    const isConfigLoaded = !isConfigLoading && !isConfigLoadingError && tableConfig;
    const defaultColumnCount = loadingConfig?.columnCount || 4;

    const [sortingColumn, setSortingColumn] = useState("id");
    const [sortingDirection, setSortingDirection] = useState<TableSortOptions>(Z_TableSortOptions.enum.ASC);

    const [actionCellWidth, setActionCellWidth] = useState<number>(0);

    const [searchValue, setSearchValue] = useState("");

    const { scrollContainer, boxShadowClasses, onScrollHandler, doShadow } = useScrollWithShadow();

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

    const tableContainerClasses = [
        style.tableContainer,
        style[`size_${tableConfig?.cellSize || Z_TableCellSizes.enum.MEDIUM}`],
    ];
    if (isFullscreen) tableContainerClasses.push(style.fullscreen);

    const tableClasses = [style.table];
    if (isLoading) tableClasses.push(style.loading);

    const checkChanges = () => {};

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
            <TableStateContext.Provider
                value={{
                    isModalTableConfigResetHard: isModalTableConfigResetHard,
                    setModalTableConfigResetHard: setModalTableConfigResetHard,

                    isSavedSettings: isSavedSettings,
                    setSavedSettings: setSavedSettings,

                    checkChanges: checkChanges,

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
                }}
            >
                <TableUIContext.Provider value={UI}>
                    <div className={tableContainerClasses.join(" ")}>
                        <SettingsModal open={isSettingsModalOpen} setOpen={setSettingsModalOpen} tableTitle={tableTitle} />
                        <TopBar
                            title={tableTitle}
                            isConfigLoading={isConfigLoading}
                            isDataLoading={isDataLoading}
                            isError={isError}
                            isFullscreen={isFullscreen}
                            computedLoadingConfig={computedLoadingConfig}
                            toggleFullscreen={toggleFullscreen}
                            openSettingsModal={openSettingsModal}
                        />
                        <div className={boxShadowClasses.map((boxShadowClass) => style[boxShadowClass]).join(" ")}>
                            <div ref={scrollContainer} style={{ overflowX: "auto" }} onScroll={onScrollHandler}>
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
                                                    data={data}
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
                    </div>
                </TableUIContext.Provider>
            </TableStateContext.Provider>
        </TableConfigContext.Provider>
    );
};

export default Table;
