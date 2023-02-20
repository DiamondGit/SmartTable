import { FLAG, INDEX_JOINER } from "../constants/general";
import { TablePinOptions, Z_DependencyTypes, Z_TableFieldTypes, Z_TablePinOptions } from "../types/enums";
import {
    ColumnBaseSchema,
    ColumnInitialType,
    ColumnPinType,
    ColumnType,
    FilterItemType,
    GeneralObject,
    TableConfigInitialSchema,
    TableConfigType,
} from "../types/general";

export const formatDate = (date: string) =>
    new Date(date).toLocaleString("ru", { year: "numeric", month: "numeric", day: "numeric" }).split("г.")[0];

export const getDeepValue = (object: GeneralObject, path: string) => {
    const splittedPath = path.split(".");
    let tempResult = object[splittedPath[0]];

    for (let i = 1; i < splittedPath.length; i++) {
        tempResult = tempResult?.[splittedPath[i]];
    }

    return tempResult;
};

export const getPinSide = (pin: TablePinOptions): string => {
    if (pin === Z_TablePinOptions.enum.LEFT) return "left";
    return "right";
};

export const getPinOffset = (columnPins: ColumnPinType[], pin: TablePinOptions, namedDataIndex: string): number => {
    const targetColumn = columnPins.find((column) => column.namedDataIndex === namedDataIndex);
    if (!targetColumn) return 0;

    const topLevelColumn = columnPins.find((column) => column.mainOrder === targetColumn.mainOrder && column.level === 0);
    if (!topLevelColumn) return 0;

    const moveDown = (currentColumn = topLevelColumn, parentOffset = 0) => {
        const neighborColumns = columnPins.filter(
            (columnPin) =>
                columnPin.pin === pin &&
                columnPin.level === currentColumn.level &&
                columnPin.order < currentColumn.order &&
                (currentColumn.level === 0 || columnPin.mainOrder === currentColumn.mainOrder)
        );
        const ownOffset = neighborColumns.reduce((widthSum, columnWidth) => widthSum + columnWidth.width, 0) + parentOffset;

        if (currentColumn.namedDataIndex === targetColumn.namedDataIndex) {
            return ownOffset;
        }

        const subcolumns = columnPins.filter(
            (column) =>
                column.namedDataIndex.startsWith(currentColumn.namedDataIndex) && column.level === currentColumn.level + 1
        );
        if (subcolumns.length > 0) {
            let tempResult: number[] = [];
            subcolumns.forEach((column) => {
                tempResult = tempResult.concat(moveDown(column, ownOffset));
            });
            return Math.max(...tempResult);
        }
        return 0;
    };

    return moveDown();
};

export const getColumnStyle = (
    isPinned: boolean,
    pin: TablePinOptions,
    columnPins: ColumnPinType[],
    namedDataIndex: string
) => ({
    ...(isPinned
        ? {
              [getPinSide(pin)]: getPinOffset(columnPins, pin, namedDataIndex),
          }
        : {}),
});

export const getMaxHeadingDepth = (table: ColumnType[]) => {
    let maxDepth = 0;
    const computeDepth = (column: ColumnType, depth = 1) => {
        if (!column.subcolumns || !column.title) return depth;
        let currentMaxDepth = depth + 1;
        column.subcolumns.forEach((subcolumn) => {
            const tempDepth = computeDepth(subcolumn, currentMaxDepth);
            if (tempDepth > currentMaxDepth) currentMaxDepth = tempDepth;
        });
        return currentMaxDepth;
    };

    table.forEach((column) => {
        const tempDepth = computeDepth(column);
        if (tempDepth > maxDepth) maxDepth = tempDepth;
    });

    return maxDepth;
};

export const joinIndexes = (...indexes: number[]) => {
    return indexes.join(INDEX_JOINER);
};

export const splitIndexes = (indexes: string) => {
    return indexes.split(INDEX_JOINER).map((index) => parseInt(index));
};

const defineDefaultsTableSchema = (initialColumn: ColumnInitialType) => ColumnBaseSchema.passthrough().parse(initialColumn);
const filterDuplicateColumns = (
    targetColumn: ColumnInitialType,
    targetIndex: number,
    initialColumns: ColumnInitialType[]
) => {
    //  Keeps only first met column duplicated title or dataIndex
    const hasSameTitle = (column: ColumnInitialType) =>
        !!targetColumn.title && !!column.title && targetColumn.title === column.title;
    const hasSameDataIndex = (column: ColumnInitialType) =>
        !!targetColumn.dataIndex && !!column.dataIndex && targetColumn.dataIndex === column.dataIndex;
    const hasSameFieldTitle = (column: ColumnInitialType) =>
        !!targetColumn.field &&
        !!targetColumn.field.title &&
        !!column.field?.title &&
        targetColumn.field.title === column.field?.title;
    const hasSameFieldDataIndex = (column: ColumnInitialType) =>
        !!targetColumn.field &&
        !!targetColumn.field.dataIndex &&
        !!column.field?.dataIndex &&
        targetColumn.field.dataIndex === column.field?.dataIndex;
    const hasSameFilterTitle = (column: ColumnInitialType) =>
        !!targetColumn.filterField &&
        !!targetColumn.filterField.title &&
        !!column.filterField?.title &&
        targetColumn.filterField.title === column.filterField?.title;
    const hasSameFilterDataIndex = (column: ColumnInitialType) =>
        !!targetColumn.filterField &&
        !!targetColumn.filterField.dataIndex &&
        !!column.filterField?.dataIndex &&
        targetColumn.filterField.dataIndex === column.filterField?.dataIndex;
    return (
        initialColumns.findIndex(
            (column) =>
                hasSameTitle(column) ||
                hasSameDataIndex(column) ||
                hasSameFieldTitle(column) ||
                hasSameFieldDataIndex(column) ||
                hasSameFilterTitle(column) ||
                hasSameFilterDataIndex(column)
        ) === targetIndex
    );
};

const filterAvailableColumns = (column: ColumnInitialType) => {
    if (column.subcolumns) {
        if (!column.title) return false;
    } else {
        if (column.title) {
            if (!column.dataIndex) return false;
        } else {
            if ((column.field && !column.field.title) || (column.filterField && !column.filterField.title)) return false;
        }
        if (column.filterField && !column.filterField.dataIndex) return false;
        if (
            column.filterField &&
            column.filterField.type === Z_TableFieldTypes.enum.CONDITION &&
            (!column.filterField.conditionalDataIndex?.from || !column.filterField.conditionalDataIndex.to)
        )
            return false;
    }
    return true;
};

const getFullyComputedColumns = (columns: ColumnInitialType[]) => {
    return columns.filter(filterAvailableColumns).filter(filterDuplicateColumns);
};

const computeColumnSchema = (
    initialColumn: ColumnInitialType,
    maxHeadingDepth: number,
    mainOrder: number,
    prevPath = "",
    rowLevel = 0,
    prevNamedDataIndex = ""
) => {
    const currentPath = prevPath + (initialColumn.dataIndex ? `${prevPath ? "." : ""}${initialColumn.dataIndex}` : "");
    const currentNamedDataIndex = `${prevNamedDataIndex ? `${prevNamedDataIndex}_` : ""}${initialColumn.title}`;

    let generalDeployer: ColumnInitialType = {
        [FLAG.path]: currentPath,
    };

    if (initialColumn.field) {
        if (!initialColumn.field?.title) {
            generalDeployer = {
                ...generalDeployer,
                field: {
                    ...initialColumn.field,
                    ...generalDeployer.field,
                    title: initialColumn.title,
                },
            };
        }
        if (!initialColumn.field?.type) {
            generalDeployer = {
                ...generalDeployer,
                field: {
                    ...initialColumn.field,
                    ...generalDeployer.field,
                    type: Z_TableFieldTypes.enum.NONE,
                },
            };
        }
        if (!initialColumn.field?.initValue) {
            generalDeployer = {
                ...generalDeployer,
                field: {
                    ...initialColumn.field,
                    ...generalDeployer.field,
                    initValue: null,
                },
            };
        }
    }
    if (initialColumn.filterField) {
        if (
            !initialColumn.isFilterable &&
            initialColumn.filterField.type &&
            initialColumn.filterField.type !== Z_TableFieldTypes.enum.NONE
        ) {
            generalDeployer = {
                ...generalDeployer,
                isFilterable: true,
            };
        }
        if (!initialColumn.filterField?.title) {
            generalDeployer = {
                ...generalDeployer,
                filterField: {
                    ...initialColumn.filterField,
                    ...generalDeployer.filterField,
                    title: initialColumn.title,
                },
            };
        }
        if (!initialColumn.filterField?.type) {
            generalDeployer = {
                ...generalDeployer,
                filterField: {
                    ...initialColumn.filterField,
                    ...generalDeployer.filterField,
                    type: Z_TableFieldTypes.enum.NONE,
                },
            };
        }
        if (!initialColumn.filterField?.initValue) {
            generalDeployer = {
                ...generalDeployer,
                filterField: {
                    ...initialColumn.filterField,
                    ...generalDeployer.filterField,
                    initValue: null,
                },
            };
        }
    } else if (!initialColumn.filterField && initialColumn.isFilterable) {
        generalDeployer = {
            ...generalDeployer,
            filterField: { ...initialColumn.field, ...generalDeployer.field, dependType: Z_DependencyTypes.enum.INDEP },
        };
    }
    if (initialColumn.dependField && !initialColumn.field?.dependType) {
        generalDeployer = {
            ...generalDeployer,
            field: {
                ...initialColumn.field,
                ...generalDeployer.field,
                dependType: Z_DependencyTypes.enum.FULL,
            },
        };
    }
    if (initialColumn.field?.type === Z_TableFieldTypes.enum.MULTISELECT && !initialColumn.field?.initValue) {
        generalDeployer = {
            ...generalDeployer,
            field: {
                ...initialColumn.field,
                ...generalDeployer.field,
                initValue: [],
            },
        };
    }
    if (initialColumn.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT && !initialColumn.filterField?.initValue) {
        generalDeployer = {
            ...generalDeployer,
            filterField: {
                ...initialColumn.filterField,
                ...generalDeployer.filterField,
                initValue: [],
            },
        };
    }
    if (!initialColumn.title) {
        return {
            ...initialColumn,
            ...generalDeployer,
        };
    }

    generalDeployer = {
        ...generalDeployer,
        [FLAG.colSpan]: 1,
        [FLAG.rowSpan]: 1,
        [FLAG.rowLevel]: rowLevel,
        [FLAG.mainOrder]: mainOrder,
        [FLAG.namedDataIndex]: currentNamedDataIndex,
    };

    if (initialColumn.subcolumns) {
        const computedSubcolumns: ColumnInitialType[] = getFullyComputedColumns(
            [...initialColumn.subcolumns].map((subcolumn) =>
                computeColumnSchema(subcolumn, maxHeadingDepth, mainOrder, currentPath, rowLevel + 1, currentNamedDataIndex)
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
            resultColumn[FLAG.rowSpan] = maxHeadingDepth - rowLevel;
        }

        return defineDefaultsTableSchema(resultColumn as ColumnInitialType);
    } else
        return defineDefaultsTableSchema({
            ...initialColumn,
            ...generalDeployer,
            [FLAG.rowSpan]: maxHeadingDepth - rowLevel,
        });
};

const computeTableSchema = (intialTable: ColumnInitialType[], maxHeadingDepth = 1): ColumnType[] => {
    let mainOrder = 0;
    const getNextMainOrder = (column: ColumnInitialType) => {
        if (column.title) return mainOrder++;
        return -1;
    };
    return getFullyComputedColumns(
        [...intialTable].map((column) => computeColumnSchema(column, maxHeadingDepth, getNextMainOrder(column)))
    ) as ColumnType[];
};

export const parseConfig = (config: object, isSafeParse = true) => {
    if (isSafeParse) {
        const initialParse = TableConfigInitialSchema.safeParse(config);
        if (initialParse.success) {
            try {
                let parsedConfig = computeTableSchema(initialParse.data.table);
                const maxHeadingDepth = getMaxHeadingDepth(parsedConfig);
                parsedConfig = computeTableSchema(initialParse.data.table, maxHeadingDepth);

                const computedConfig: TableConfigType = {
                    ...initialParse.data,
                    table: parsedConfig,
                };

                return computedConfig;
            } catch (error) {
                return null;
            }
        }
    } else {
        const initialParse = TableConfigInitialSchema.parse(config);
        let parsedConfig = computeTableSchema(initialParse.table);
        const maxHeadingDepth = getMaxHeadingDepth(parsedConfig);
        parsedConfig = computeTableSchema(initialParse.table, maxHeadingDepth);

        const computedConfig: TableConfigType = {
            ...initialParse,
            table: parsedConfig,
        };

        return computedConfig;
    }
    return null;
};

const isAvailableTableColumn = (column: ColumnType) => {
    return !!column.title && (!!column.dataIndex || !!column.subcolumns);
};

export const getUpLevelColumns = (table: ColumnType[]) => {
    return [...table].filter((column) => isAvailableTableColumn(column));
};

export const getDownLevelColumns = (table: ColumnType[]) => {
    const diveSubcolumns = (column: ColumnType): ColumnType[] | ColumnType => {
        if (column.subcolumns) {
            let result: ColumnType[] = [];
            column.subcolumns.forEach((subcolumn) => {
                result = result.concat(diveSubcolumns(subcolumn));
            });
            return result;
        }
        return isAvailableTableColumn(column) ? column : [];
    };
    let result: ColumnType[] = [];
    table.forEach((column) => {
        result = result.concat(diveSubcolumns(column));
    });
    return result;
};

export const getFilterFields = (table: ColumnType[]) => {
    return table.filter((column) => column.isFilterable && column.filterField?.type !== Z_TableFieldTypes.enum.BOOLEAN);
};

export const getModalFields = (table: ColumnType[]) => {
    return [...table].filter((column) => !!column.field);
};
