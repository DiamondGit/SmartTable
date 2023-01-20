import { useContext, useEffect, useState } from "react";
import { FLAG } from "../../constants/general";
import ConfigContext from "../../context/ConfigContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { getTableConfig } from "../../controllers/controllers";
import { getMaxHeadingDepth } from "../../functions/global";
import { TablePinOptions, Z_TablePinOptions } from "../../types/enums";
import {
    ColumnBaseSchema,
    ColumnInitialType,
    ColumnType,
    SavedTableConfigListSchema,
    SavedTableConfigListType,
    TableConfigInitialSchema,
    TableConfigType,
} from "../../types/general";

interface ConfigProviderType {
    children: React.ReactNode;
}

const ConfigProvider = ({ children }: ConfigProviderType) => {
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);
    const [defaultTableConfig, setDefaultTableConfig] = useState<TableConfigType>();
    const [tableConfig, setTableConfig] = useState<TableConfigType>();
    const [modalTableConfig, setModalTableConfig] = useState<TableConfigType>();
    const [savedTableConfigList, setSavedTableConfigList] = useState<SavedTableConfigListType>([]);

    useEffect(() => {
        fetchConfig();
    }, []);

    const defineDefaultsTableSchema = (initialColumn: ColumnInitialType) => {
        return ColumnBaseSchema.passthrough().parse(initialColumn);
    };

    const filterDuplicateColumns = (
        targetColumn: ColumnInitialType,
        targetIndex: number,
        initialColumns: ColumnInitialType[]
    ) => {
        //  Keeps only first met column duplicated title or dataIndex
        const duplicateColumns: (ColumnInitialType & { order: number })[] = initialColumns
            .map((column, index) => ({ ...column, order: index }))
            .filter(
                (column: ColumnInitialType, index: number, columns: ColumnInitialType[]) =>
                    index ===
                    columns.findIndex(
                        (tempColumn) =>
                            tempColumn.title === column.title ||
                            (!!column.dataIndex && tempColumn.dataIndex === column.dataIndex)
                    )
            );

        return duplicateColumns.some(
            (column) => JSON.stringify(column) === JSON.stringify({ ...targetColumn, order: targetIndex })
        );
    };

    const filterAvailableColumns = (column: ColumnInitialType) =>
        !!column.title && (!!column.dataIndex || !!column.subcolumns);

    const getFullyComputedColumns = (columns: ColumnInitialType[]) => {
        return columns.filter(filterAvailableColumns).filter(filterDuplicateColumns);
    };

    const computeColumnSchema = (
        initialColumn: ColumnInitialType,
        maxHeadingDepth: number,
        prevPath = "",
        rowLevel = 1,
        prevNamedDataIndex = ""
    ) => {
        const currentPath = prevPath + (initialColumn.dataIndex ? `${prevPath ? "." : ""}${initialColumn.dataIndex}` : "");

        const generalDeployer = {
            [FLAG.path]: currentPath,
            [FLAG.rowLevel]: rowLevel,
            [FLAG.namedDataIndex]: `${prevNamedDataIndex ? `${prevNamedDataIndex}_` : ""}${initialColumn.title}`,
        };

        if (initialColumn.subcolumns) {
            const computedSubcolumns: ColumnInitialType[] = getFullyComputedColumns(
                [...initialColumn.subcolumns].map((subcolumn) =>
                    computeColumnSchema(subcolumn, maxHeadingDepth, currentPath, rowLevel + 1, initialColumn.title)
                )
            );

            const totalColSpan =
                computedSubcolumns.reduce(
                    (colSpanSum, computedSubcolumn) => colSpanSum + (computedSubcolumn[FLAG.colSpan] || 0),
                    0
                ) || 1;

            const resultColumn: Partial<ColumnInitialType> = {
                ...initialColumn,
                ...generalDeployer,
                sortable: false,
                subcolumns: computedSubcolumns,
                [FLAG.colSpan]: totalColSpan,
            };

            if (computedSubcolumns.length === 0) {
                delete resultColumn.subcolumns;
                resultColumn[FLAG.rowSpan] = maxHeadingDepth - rowLevel + 1;
            }

            return defineDefaultsTableSchema(resultColumn as ColumnInitialType);
        } else
            return defineDefaultsTableSchema({
                ...initialColumn,
                ...generalDeployer,
                [FLAG.rowSpan]: maxHeadingDepth - rowLevel + 1,
            });
    };

    const computeTableSchema = (intialTable: ColumnInitialType[], maxHeadingDepth = 1): ColumnType[] => {
        return getFullyComputedColumns(
            [...intialTable].map((column) => computeColumnSchema(column, maxHeadingDepth))
        ) as ColumnType[];
    };

    const fetchConfig = () => {
        stateContext.setConfigLoading(true);
        stateContext.setConfigLoadingError(false);
        getTableConfig(propsContext.tableName, propsContext.userId)
            .then((res) => {
                const initialDefaultTableConfig = TableConfigInitialSchema.parse(res.defaultTableConfig);
                let computedDefaultTable = computeTableSchema(initialDefaultTableConfig.table);
                const maxHeadingDepth = getMaxHeadingDepth(computedDefaultTable);
                computedDefaultTable = computeTableSchema(initialDefaultTableConfig.table, maxHeadingDepth);

                const computedDefaultTableConfig: TableConfigType = {
                    ...initialDefaultTableConfig,
                    table: computedDefaultTable,
                };

                console.log("Computed Default Table:", computedDefaultTable);

                setDefaultTableConfig(computedDefaultTableConfig);

                const savedTableConfigList = SavedTableConfigListSchema.safeParse(res.savedTableConfigs);
                const computedSavedTableConfigList = savedTableConfigList.success ? savedTableConfigList.data : [];
                setSavedTableConfigList(computedSavedTableConfigList);

                const recentSavedTableConfig = computedSavedTableConfigList.find(
                    (savedTableConfig) => savedTableConfig.isRecent
                );
                const computedTableConfig = recentSavedTableConfig?.tableConfig
                    ? (JSON.parse(recentSavedTableConfig.tableConfig?.toString()) as TableConfigType)
                    : computedDefaultTableConfig;
                setTableConfig(computedTableConfig);
                setModalTableConfig(computedTableConfig);

                stateContext.setMaxHeadingDepth(getMaxHeadingDepth(computedTableConfig.table));
                console.log("--- Success CONFIG ---");
            })
            .catch((error) => {
                console.log("--- Error CONFIG ---");
                stateContext.setConfigLoadingError(true);
            })
            .finally(() => {
                stateContext.setConfigLoading(false);
            });
    };

    const setAndCompareTempTableConfig = (newTableConfig: TableConfigType) => {
        setModalTableConfig(newTableConfig);
    };

    const setAndCompareTableConfig = (newTableConfig: TableConfigType) => {
        setTableConfig(newTableConfig);
    };

    const checkHasPin = (pinOption: TablePinOptions) => {
        return tableConfig?.table?.some((column) => column.pin === pinOption) || false;
    };

    return (
        <ConfigContext.Provider
            value={{
                defaultTableConfig,

                tableConfig,
                setTableConfig: setAndCompareTableConfig,

                modalTableConfig,
                setModalTableConfig: setAndCompareTempTableConfig,

                savedTableConfigList,

                selectedSavedTableConfigId: null,

                hasLeftPin: checkHasPin(Z_TablePinOptions.enum.LEFT),
                hasRightPin: checkHasPin(Z_TablePinOptions.enum.RIGHT),
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;
