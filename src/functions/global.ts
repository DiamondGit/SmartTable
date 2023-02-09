import { FLAG, INDEX_JOINER } from "../constants/general";
import { TablePinOptions, Z_TablePinOptions } from "../types/enums";
import {
    ColumnBaseSchema,
    ColumnInitialType,
    ColumnPinType,
    ColumnType,
    TableConfigInitialSchema,
    TableConfigType,
} from "../types/general";

export const formatDate = (date: string) =>
    new Date(date).toLocaleString("ru", { year: "numeric", month: "numeric", day: "numeric" }).split("г.")[0];

export const getDeepValue = (object: { [key: string]: any }, path: string) => {
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
        if (!column.subcolumns) return depth;
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

const filterAvailableColumns = (column: ColumnInitialType) => !!column.title && (!!column.dataIndex || !!column.subcolumns);

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

    const generalDeployer = {
        [FLAG.path]: currentPath,
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
    return getFullyComputedColumns(
        [...intialTable].map((column, index) => computeColumnSchema(column, maxHeadingDepth, index))
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