import z from "zod";
import { FLAG } from "../constants/general";
import {
    PaginationPositionType,
    TablePinOptions,
    Z_PaginationPositions,
    Z_TableCellSizes,
    Z_TableDataTypes,
    Z_TableFilterTypes,
    Z_TablePinOptions,
} from "./enums";
import { TableUIStartingType } from "./UI";

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

const columnBooleanDefaults = {
    enabled: {
        default: true,
        catch: false,
    },
    disabled: {
        default: false,
        catch: true,
    },
};
const columnDefaults = {
    dataType: Z_TableDataTypes.enum.OTHER,
    sortable: columnBooleanDefaults.enabled,
    filterType: Z_TableFilterTypes.enum.NONE,
    visible: columnBooleanDefaults.enabled,
    hidable: columnBooleanDefaults.enabled,
    pin: Z_TablePinOptions.enum.NONE,
    highlighted: columnBooleanDefaults.disabled,
    modifiableContent: columnBooleanDefaults.disabled,
};

export const ColumnBaseSchema = z.object({
    title: z.string(),
    dataIndex: z.string().optional(),
    dataType: Z_TableDataTypes.default(columnDefaults.dataType).catch(columnDefaults.dataType),
    sortable: z.boolean().default(columnDefaults.sortable.default).catch(columnDefaults.sortable.catch),
    filterType: Z_TableFilterTypes.default(columnDefaults.filterType).catch(columnDefaults.filterType),
    filterDependency: z.string().optional(),
    visible: z.boolean().default(columnDefaults.visible.default).catch(columnDefaults.visible.catch),
    hidable: z.boolean().default(columnDefaults.hidable.default).catch(columnDefaults.hidable.catch),
    pin: Z_TablePinOptions.default(columnDefaults.pin).catch(columnDefaults.pin),
    highlighted: z.boolean().default(columnDefaults.highlighted.default).catch(columnDefaults.highlighted.catch),
    modifiableContent: z
        .boolean()
        .default(columnDefaults.modifiableContent.default)
        .catch(columnDefaults.modifiableContent.catch),
});
type ColumnBaseType = z.infer<typeof ColumnBaseSchema>;

const ColumnInitialBaseSchema = ColumnBaseSchema.partial();
type ColumnInitialBaseType = z.infer<typeof ColumnInitialBaseSchema>;

type ColumnFlagExtension = {
    [FLAG.colSpan]: number;
    [FLAG.rowSpan]: number;
    [FLAG.rowLevel]: number;
    [FLAG.path]: string;
    [FLAG.namedDataIndex]: string;
    [FLAG.mainOrder]: number;
};

export type ColumnType = ColumnBaseType &
    ColumnFlagExtension & {
        subcolumns?: ColumnType[];
    };

export type ColumnInitialType = ColumnInitialBaseType &
    Partial<ColumnFlagExtension> & {
        subcolumns?: ColumnInitialType[];
    };
export const ColumnInitialSchema: z.ZodType<ColumnInitialType> = z.lazy(() =>
    ColumnInitialBaseSchema.merge(
        z.object({
            subcolumns: z.array(ColumnInitialSchema).optional(),
            [FLAG.colSpan]: z.number().default(1),
            [FLAG.rowSpan]: z.number().default(1),
        })
    )
);

const tableConfigDefaults = {
    cellSize: Z_TableCellSizes.enum.MEDIUM,
    editable: true,
    deletable: true,
    isDashboard: false,
    loadable: false,
    highlightable: true,
    warningText: null,
};

const TableConfigBaseSchema = z.object({
    cellSize: Z_TableCellSizes.default(tableConfigDefaults.cellSize).catch(tableConfigDefaults.cellSize),
    editable: z.boolean().default(tableConfigDefaults.editable).catch(tableConfigDefaults.editable),
    deletable: z.boolean().default(tableConfigDefaults.deletable).catch(tableConfigDefaults.deletable),
    isDashboard: z.boolean().default(tableConfigDefaults.isDashboard).catch(tableConfigDefaults.isDashboard),
    loadable: z.boolean().default(tableConfigDefaults.loadable).catch(tableConfigDefaults.loadable),
    highlightable: z.boolean().default(tableConfigDefaults.highlightable).catch(tableConfigDefaults.highlightable),
    warningText: z.string().nullable().default(tableConfigDefaults.warningText).catch(tableConfigDefaults.warningText),
});
type TableConfigBaseType = z.infer<typeof TableConfigBaseSchema>;

export const TableConfigInitialSchema = TableConfigBaseSchema.merge(
    z.object({
        table: z.array(ColumnInitialSchema),
    })
);
export type TableConfigInitialType = z.infer<typeof TableConfigInitialSchema>;

export type TableConfigType = TableConfigBaseType & {
    table: ColumnType[];
};

const LiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type LiteralType = z.infer<typeof LiteralSchema>;
type JsonType = LiteralType | { [key: string]: JsonType } | JsonType[];
export const JsonSchema: z.ZodType<JsonType> = z.lazy(() =>
    z.union([LiteralSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

const SavedTableConfigBaseSchema = z.object({
    id: z.number(),
    configName: z.string(),
    recent: z.boolean().default(false),
    createdAt: z.string().datetime({ offset: true }),
});
type SavedTableConfigBaseType = z.infer<typeof SavedTableConfigBaseSchema>;

export const SavedTableConfigInitialSchema = SavedTableConfigBaseSchema.merge(
    z.object({
        configParams: JsonSchema,
    })
);
export type SavedTableConfigInitialType = z.infer<typeof SavedTableConfigInitialSchema>;

export type SavedTableConfigType = SavedTableConfigBaseType & {
    configParams: TableConfigType;
};

const defaultPaginationPosition = Z_PaginationPositions.enum.RIGHT;
export const PaginationPositionSchema =
    Z_PaginationPositions.default(defaultPaginationPosition).catch(defaultPaginationPosition);

type DataComputedCountType = {
    totalItems: number;
    totalPages: number;
};

export type PaginationConfigType = {
    hideTotal?: boolean;
    hideSizeChanger?: boolean;
    pageSizeOptions?: number[];
    hideTop?: boolean;
    hideBottom?: boolean;
    bottomPosition?: PaginationPositionType;
} & (
    | { singleData: true; dataComputedCount?: never; getData?: never }
    | {
          singleData?: false;
          dataComputedCount: DataComputedCountType;
          getData: (currentPage: number, pageSize: number, sortField?: string, sortDir?: string) => void;
      }
);

export type TableFilterItemType = {
    id: number;
    field: string | undefined;
    isExclusion: boolean;
    isActive: boolean;
    value: any;
};

export type SavedTableFilterItemType = TableFilterItemType & { name: string; isRecent: boolean };

export type ColumnPinType = {
    namedDataIndex: string;
    pin: TablePinOptions;
    width: number;
    order: number;
    level: number;
    mainOrder: number;
};

export type TableCreateType = {
    configsStoragePath: string;
    customUI?: TableUIStartingType;
};

export type TableInitializationType = {
    tableTitle: string;
    tableConfigPath: string;
    loadingConfig?: {
        columnCount: number;
        rowCount?: number;
        noFuncBtnsLeft?: boolean;
        noFuncBtnsRight?: boolean;
    };
    paginationConfig?: PaginationConfigType;
    contentModifier?: { [key: string]: (record: { [key: string]: any }) => JSX.Element | string | number };
    filterApiProvider?: { [key: string]: string };
    data: any[];
    isDataError?: boolean;
    isDataLoading?: boolean;
};

export type ComputedRowType = ColumnType[];

export type ComputedRowLevelType = {
    [Z_TablePinOptions.enum.LEFT]: ComputedRowType;
    [Z_TablePinOptions.enum.NONE]: ComputedRowType;
    [Z_TablePinOptions.enum.RIGHT]: ComputedRowType;
};

export type ComputedRowLevelsType = ComputedRowLevelType[];

export type ConfigBaseType = {
    configName: string;
    configParams: { [key: string]: any };
};

export type CreateConfigType = ConfigBaseType & {
    tableName: string;
};

export type UpdateConfigType = ConfigBaseType & {
    id: number;
    tableName: string;
};
