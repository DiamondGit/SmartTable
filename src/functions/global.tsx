import AddBoxIcon from "@mui/icons-material/AddBox";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { message } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { FLAG, INDEX_JOINER } from "../constants/general";
import {
    DependencyActionType,
    ModalTypes,
    TablePinOptions,
    Z_DependencyActions,
    Z_DependencyTypes,
    Z_ModalTypes,
    Z_TableFieldTypes,
    Z_TablePinOptions
} from "../types/enums";
import {
    ColumnBaseSchema,
    ColumnInitialType,
    ColumnPinType,
    ColumnType, GeneralObject,
    TableConfigInitialSchema,
    TableConfigType
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
        // if (namedDataIndex === "Система") {
        //     console.log(neighborColumns);
        //     console.log(namedDataIndex, ownOffset);
        // }
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
    const hasSameFieldDataIndexWrite = (column: ColumnInitialType) =>
        !!targetColumn.field &&
        !!targetColumn.field.dataIndex_write &&
        !!column.field?.dataIndex_write &&
        targetColumn.field.dataIndex_write === column.field?.dataIndex_write;
    const hasSameFieldDataIndexRead = (column: ColumnInitialType) =>
        !!targetColumn.field &&
        !!targetColumn.field.dataIndex_read &&
        !!column.field?.dataIndex_read &&
        targetColumn.field.dataIndex_read === column.field?.dataIndex_read;
    const hasSameFilterTitle = (column: ColumnInitialType) =>
        !!targetColumn.filterField &&
        !!targetColumn.filterField.title &&
        !!column.filterField?.title &&
        targetColumn.filterField.title === column.filterField?.title;
    const hasSameFilterDataIndexWrite = (column: ColumnInitialType) =>
        !!targetColumn.filterField &&
        !!targetColumn.filterField.dataIndex_write &&
        !!column.filterField?.dataIndex_write &&
        targetColumn.filterField.dataIndex_write === column.filterField?.dataIndex_write;
    const hasSameFilterDataIndexRead = (column: ColumnInitialType) =>
        !!targetColumn.filterField &&
        !!targetColumn.filterField.dataIndex_read &&
        !!column.filterField?.dataIndex_read &&
        targetColumn.filterField.dataIndex_read === column.filterField?.dataIndex_read;
    return (
        initialColumns.findIndex(
            (column) =>
                hasSameTitle(column) ||
                hasSameDataIndex(column) ||
                hasSameFieldTitle(column) ||
                hasSameFieldDataIndexWrite(column) ||
                hasSameFieldDataIndexRead(column) ||
                hasSameFilterTitle(column) ||
                hasSameFilterDataIndexWrite(column) ||
                hasSameFilterDataIndexRead(column)
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
            if (column.field && !column.field.title) return false;
            if (column.filterField && !column.filterField.title) return false;
        }
        if (column.filterField && !column.filterField.dataIndex_write) return false;
        if (column.field && column.field.type === Z_TableFieldTypes.enum.CONDITION) return false;
        if (
            column.filterField &&
            column.filterField.type === Z_TableFieldTypes.enum.CONDITION &&
            (!column.filterField.conditionalDataIndex?.from || !column.filterField.conditionalDataIndex?.to)
        )
            return false;
        if (
            column.onDependChange &&
            typeof column.onDependChange === "object" &&
            !Array.isArray(column.onDependChange) &&
            (column.onDependChange.value === undefined || !column.onDependChange.onTrue || !column.onDependChange.onFalse)
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

    let columnConstructor: ColumnInitialType = {
        ...initialColumn,
    };

    if (columnConstructor.field) {
        if (!columnConstructor.field.title) {
            columnConstructor.field.title = columnConstructor.title;
        }
        if (!columnConstructor.field.type) {
            columnConstructor.field.type = Z_TableFieldTypes.enum.NONE;
        }
        if (
            columnConstructor.field.initValue === undefined &&
            columnConstructor.field.type !== Z_TableFieldTypes.enum.BOOLEAN
        ) {
            columnConstructor.field.initValue = null;
        }
        if (!columnConstructor.field.dataIndex_read) {
            columnConstructor.field.dataIndex_read = columnConstructor.dataIndex;
        }
        if (!columnConstructor.field.dataIndex_write) {
            columnConstructor.field.dataIndex_write = columnConstructor.dataIndex;
        }
        if (columnConstructor.field.type === Z_TableFieldTypes.enum.BOOLEAN) {
            if (columnConstructor.field.initValue !== undefined) {
                if (
                    columnConstructor.field.booleanDataIndex?.onTrue !== undefined &&
                    columnConstructor.field.booleanDataIndex?.onFalse !== undefined
                ) {
                    if (
                        columnConstructor.field.booleanDataIndex.onTrue !== columnConstructor.field.initValue &&
                        columnConstructor.field.booleanDataIndex.onFalse !== columnConstructor.field.initValue
                    ) {
                        delete columnConstructor.field.booleanDataIndex;
                        columnConstructor.field.initValue = false;
                    }
                } else if (typeof columnConstructor.field.initValue !== "boolean") {
                    delete columnConstructor.field.booleanDataIndex;
                    columnConstructor.field.initValue = false;
                } else {
                }
            } else {
                if (
                    columnConstructor.field.booleanDataIndex?.onTrue !== undefined &&
                    columnConstructor.field.booleanDataIndex?.onFalse !== undefined
                ) {
                    columnConstructor.field.initValue = columnConstructor.field.booleanDataIndex.onFalse;
                } else {
                    delete columnConstructor.field.booleanDataIndex;
                    columnConstructor.field.initValue = false;
                }
            }
        }
    } else {
        columnConstructor.field = null;
    }
    if (columnConstructor.filterField) {
        if (
            !columnConstructor.isFilterable &&
            columnConstructor.filterField.type &&
            columnConstructor.filterField.type !== Z_TableFieldTypes.enum.NONE
        ) {
            columnConstructor.isFilterable = true;
        }
        if (!columnConstructor.filterField.title) {
            columnConstructor.filterField.title = columnConstructor.title;
        }
        if (!columnConstructor.filterField.type) {
            columnConstructor.filterField.type = Z_TableFieldTypes.enum.NONE;
        }
        if (columnConstructor.filterField.initValue === undefined) {
            columnConstructor.filterField.initValue = null;
        }
        if (!columnConstructor.filterField.dataIndex_write) {
            columnConstructor.filterField.dataIndex_write = columnConstructor.dataIndex;
        }
    } else if (columnConstructor.isFilterable) {
        columnConstructor.filterField = {
            ...columnConstructor.field,
            dependType: Z_DependencyTypes.enum.INDEP,
        };
    } else {
        columnConstructor.filterField = null;
    }
    if (columnConstructor.dependField !== undefined && !columnConstructor.field?.dependType) {
        columnConstructor.field = {
            ...columnConstructor.field,
            dependType: Z_DependencyTypes.enum.FULL,
        };
    }
    if (
        columnConstructor.onDependChange &&
        typeof columnConstructor.onDependChange === "object" &&
        !Array.isArray(columnConstructor.onDependChange)
    ) {
        if (
            !columnConstructor.onDependChange.onTrue &&
            columnConstructor.onDependChange.onFalse &&
            ([] as DependencyActionType[])
                .concat(columnConstructor.onDependChange.onFalse)
                .includes(Z_DependencyActions.enum.HIDE)
        ) {
            columnConstructor.onDependChange.onTrue = [];
        } else if (
            !columnConstructor.onDependChange.onFalse &&
            columnConstructor.onDependChange.onTrue &&
            ([] as DependencyActionType[])
                .concat(columnConstructor.onDependChange.onTrue)
                .includes(Z_DependencyActions.enum.HIDE)
        ) {
            columnConstructor.onDependChange.onFalse = [];
        }
    }

    if (columnConstructor.field?.type === Z_TableFieldTypes.enum.MULTISELECT) {
        if (!columnConstructor.field?.initValue || !Array.isArray(columnConstructor.field.initValue)) {
            columnConstructor.field.initValue = [];
        }
    }
    if (columnConstructor.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT) {
        if (!columnConstructor.filterField?.initValue || !Array.isArray(columnConstructor.filterField.initValue)) {
            columnConstructor.filterField.initValue = [];
        }
    }
    if (
        (columnConstructor.field?.type === Z_TableFieldTypes.enum.SELECT ||
            columnConstructor.field?.type === Z_TableFieldTypes.enum.MULTISELECT ||
            columnConstructor.filterField?.type === Z_TableFieldTypes.enum.SELECT ||
            columnConstructor.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT) &&
        !columnConstructor.valueOptionDataIndex
    ) {
        columnConstructor.valueOptionDataIndex = "id";
    }

    if (!columnConstructor.title) {
        return columnConstructor;
    }

    columnConstructor = {
        ...columnConstructor,
        [FLAG.path]: currentPath,
        [FLAG.colSpan]: 1,
        [FLAG.rowSpan]: 1,
        [FLAG.rowLevel]: rowLevel,
        [FLAG.mainOrder]: mainOrder,
        [FLAG.namedDataIndex]: currentNamedDataIndex,
    };

    if (columnConstructor.subcolumns) {
        const computedSubcolumns: ColumnInitialType[] = getFullyComputedColumns(
            [...columnConstructor.subcolumns].map((subcolumn) =>
                computeColumnSchema(subcolumn, maxHeadingDepth, mainOrder, currentPath, rowLevel + 1, currentNamedDataIndex)
            )
        );

        const totalColSpan =
            computedSubcolumns.reduce(
                (colSpanSum, computedSubcolumn) => colSpanSum + (computedSubcolumn[FLAG.colSpan] || 0),
                0
            ) || 1;

        const resultColumn: Partial<ColumnInitialType> = {
            ...columnConstructor,
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
            ...columnConstructor,
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
        } else {
            console.log(initialParse.error);
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

export const getOptionValue = (field: ColumnType, option: GeneralObject | string) =>
    typeof option === "string"
        ? option
        : field.valueOptionDataIndex
        ? option[field.valueOptionDataIndex].toString()
        : JSON.stringify(option);

export const getOptionTitle = (field: ColumnType, option: GeneralObject | string) =>
    typeof option === "string"
        ? option
        : field.displayOptionDataIndex
        ? getConstructedOptionTitle(field, option)
        : JSON.stringify(option);

const getConstructedOptionTitle = (field: ColumnType, option: GeneralObject) => {
    const result = checkAndExtractCurlyBraceWords(field.displayOptionDataIndex);
    if (Array.isArray(result)) {
        return getFormattedOptionTitle(field, option, result);
    }
    return option[field.displayOptionDataIndex];
};

const getFormattedOptionTitle = (field: ColumnType, option: GeneralObject, replaceWords: string[]) => {
    let result = field.displayOptionDataIndex;
    for (let i = 0; i < replaceWords.length; i++) {
        result = result.replaceAll(`{${replaceWords[i]}}`, getDeepValue(option, replaceWords[i]));
    }
    return result;
};

// returns array of words wrapped with {}
// "{abc} - {def}" -> ["abc", "def"];
export const checkAndExtractCurlyBraceWords = (inputString: string): string[] | string => {
    const words = [];
    let startIndex = -1;
    let braceCount = 0;
    for (let i = 0; i < inputString.length; i++) {
        if (inputString[i] === "{") {
            if (braceCount === 0) {
                startIndex = i + 1;
            }
            braceCount++;
        } else if (inputString[i] === "}") {
            braceCount--;
            if (braceCount === 0 && startIndex >= 0) {
                const word = inputString.substring(startIndex, i);
                const wordParts = word.split(".");
                let isWordValid = true;
                for (const wordPart of wordParts) {
                    if (
                        wordPart.match(/^\d/) ||
                        wordPart.endsWith(".") ||
                        wordPart.includes("{") ||
                        wordPart.includes("}") ||
                        wordPart.includes("..") ||
                        wordPart === ""
                    ) {
                        isWordValid = false;
                        break;
                    }
                }
                if (isWordValid) {
                    words.push(word);
                } else {
                    return inputString;
                }
                startIndex = -1;
            }
        }
    }
    if (braceCount !== 0 || words.length === 0) {
        return inputString;
    }
    return words;
};

export const filterOption = (input: string, option: DefaultOptionType | undefined) => {
    if (!option?.children) return false;

    if (Array.isArray(option.children)) {
        return option.children.join(" ").toLowerCase().indexOf(input.toLowerCase()) >= 0;
    } else if (typeof option.children === "string") {
        return `${option.children}`.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    return false;
};

export function declension(_form_1: string, _form_2: string, _form_3: string, withCount = true) {
    return (num: number) => {
        const form_1 = _form_1;
        const form_2 = _form_2;
        const form_3 = _form_3;

        const digit = num % 10;

        let result = withCount ? `${num} ` : "";

        if (11 <= num && num <= 20) result += form_3;
        else if (digit === 1) result += form_1;
        else if (2 <= digit && digit <= 4) result += form_2;
        else if ((5 <= digit && digit <= 9) || digit === 0) result += form_3;

        return result;
    };
}

export const askDeleteRecordByCount = (count: number) => {
    return `Вы действительно хотите удалить ${declension("запись", "записи", "записей")(count)}?`;
};

export const showMessageDeleteRecordByCount = (count: number, isSuccess = true) => {
    if (isSuccess) {
        message.success(
            `${declension("Удалена", "Удалены", "Удалено", false)(count)} ${declension(
                "запись",
                "записи",
                "записей"
            )(count)}.`,
            4
        );
    } else {
        message.error(`При попытке удаления ${declension("записи", "записей", "записей")(count)} возникла ошибка.`, 4);
    }
};

export const getModalTitle = (modalType: ModalTypes, tableTitle?: string) => {
    let title = null;
    switch (modalType) {
        case Z_ModalTypes.enum.ADD:
        case Z_ModalTypes.enum.ADD_BASED:
            title = "Добавление";
            break;
        case Z_ModalTypes.enum.UPDATE:
            title = "Изменение";
            break;
        case Z_ModalTypes.enum.FILTER:
            title = `Фильтр${tableTitle ? ` таблицы "${tableTitle}"` : ""}`;
            break;
    }

    let icon = null;
    const iconStyle = { fontSize: 24 };
    switch (modalType) {
        case Z_ModalTypes.enum.ADD:
        case Z_ModalTypes.enum.ADD_BASED:
            icon = <AddBoxIcon sx={iconStyle} />;
            break;
        case Z_ModalTypes.enum.UPDATE:
            icon = <EditIcon sx={iconStyle} />;
            break;
        case Z_ModalTypes.enum.FILTER:
            icon = <FilterAltIcon sx={iconStyle} />;
            break;
    }

    return (
        <>
            {icon}
            {title}
        </>
    );
};
