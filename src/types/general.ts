import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import z from "zod";
import { FLAG } from "../constants/general";
import {
    PaginationPositionType,
    TablePinOptions,
    Z_DependencyActions,
    Z_DependencyTypes,
    Z_PaginationPositions,
    Z_TableCellSizes,
    Z_TableDataTypes,
    Z_TableFieldTypes,
    Z_TablePinOptions,
} from "./enums";

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
const emptyString = "";

export type GeneralObject = { [key: string]: any };

const columnDefaults = {
    dataType: Z_TableDataTypes.enum.OTHER,

    isRequired: columnBooleanDefaults.disabled,
    isFilterable: columnBooleanDefaults.disabled,

    globalDependField: emptyString,

    dependField: emptyString,

    displayOptionDataIndex: emptyString,
    valueOptionDataIndex: "id",
    fieldGetApi: emptyString,
    paramOnDepend: emptyString,

    field: {
        title: emptyString,
        dataIndex: emptyString,
        type: Z_TableFieldTypes.enum.NONE,
        initValue: null,
        dependType: Z_DependencyTypes.enum.INDEP,
        defaultCatch: null,
        switchValue: null,
        conditionalDataIndex: emptyString,
        booleanDataIndex: emptyString,
    },

    pin: Z_TablePinOptions.enum.NONE,
    sortable: columnBooleanDefaults.enabled,
    visible: columnBooleanDefaults.enabled,
    hidable: columnBooleanDefaults.enabled,
    highlighted: columnBooleanDefaults.disabled,
    modifiableContent: columnBooleanDefaults.disabled,
};

const DependChangeActionSchema = Z_DependencyActions.or(z.array(Z_DependencyActions));

const DependChangeSchema = DependChangeActionSchema.or(
    z.object({
        value: z.any(),
        onTrue: DependChangeActionSchema.optional(),
        onFalse: DependChangeActionSchema.optional(),
    })
);

const ConditionalDataIndex = z.object({
    from: z.string().default(columnDefaults.field.conditionalDataIndex).catch(columnDefaults.field.conditionalDataIndex),
    to: z.string().default(columnDefaults.field.conditionalDataIndex).catch(columnDefaults.field.conditionalDataIndex),
});

const BooleanDataIndex = z.object({
    onTrue: z.string().default(columnDefaults.field.booleanDataIndex).catch(columnDefaults.field.booleanDataIndex),
    onFalse: z.string().default(columnDefaults.field.booleanDataIndex).catch(columnDefaults.field.booleanDataIndex),
});

const FieldBaseSchema = z.object({
    title: z.string().catch(columnDefaults.field.title),
    dataIndex_write: z.string().catch(columnDefaults.field.dataIndex),
    dataIndex_read: z.string().catch(columnDefaults.field.dataIndex),
    conditionalDataIndex: ConditionalDataIndex.optional(),
    booleanDataIndex: BooleanDataIndex.optional(),
    type: Z_TableFieldTypes.default(columnDefaults.field.type).catch(columnDefaults.field.type),
    initValue: z.any().default(columnDefaults.field.initValue).catch(columnDefaults.field.initValue),
    dependType: Z_DependencyTypes.default(columnDefaults.field.dependType),
});
export type FilterItemType = z.infer<typeof FieldBaseSchema>;

const FieldSchema = FieldBaseSchema.nullable()
    .default(columnDefaults.field.defaultCatch)
    .catch(columnDefaults.field.defaultCatch);
export type FieldType = z.infer<typeof FieldSchema>;

const FieldPartialSchema = FieldBaseSchema.deepPartial()
    .nullable()
    .default(columnDefaults.field.defaultCatch)
    .catch(columnDefaults.field.defaultCatch);

export const ColumnBaseSchema = z.object({
    title: z.string().optional(),
    dataIndex: z.string().optional(),
    dataType: Z_TableDataTypes.default(columnDefaults.dataType).catch(columnDefaults.dataType),

    isRequired: z.boolean().default(columnDefaults.isRequired.default).catch(columnDefaults.isRequired.catch),
    isFilterable: z.boolean().default(columnDefaults.isFilterable.default).catch(columnDefaults.isFilterable.catch),

    globalDependField: z.string().optional().catch(columnDefaults.globalDependField),

    dependField: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .catch(columnDefaults.dependField),
    onDependChange: DependChangeSchema.optional(),

    displayOptionDataIndex: z.string().optional().catch(columnDefaults.displayOptionDataIndex),
    valueOptionDataIndex: z.string().optional().catch(columnDefaults.valueOptionDataIndex),
    fieldGetApi: z.string().optional().catch(columnDefaults.fieldGetApi),
    paramOnDepend: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .catch(columnDefaults.paramOnDepend),

    field: FieldSchema,
    filterField: FieldSchema,

    pin: Z_TablePinOptions.default(columnDefaults.pin).catch(columnDefaults.pin),
    sortable: z.boolean().default(columnDefaults.sortable.default).catch(columnDefaults.sortable.catch),
    visible: z.boolean().default(columnDefaults.visible.default).catch(columnDefaults.visible.catch),
    hidable: z.boolean().default(columnDefaults.hidable.default).catch(columnDefaults.hidable.catch),
    highlighted: z.boolean().default(columnDefaults.highlighted.default).catch(columnDefaults.highlighted.catch),
    modifiableContent: z
        .boolean()
        .default(columnDefaults.modifiableContent.default)
        .catch(columnDefaults.modifiableContent.catch),
});
type ColumnBaseType = z.infer<typeof ColumnBaseSchema>;

const ColumnInitialBaseSchema = ColumnBaseSchema.extend({
    field: FieldPartialSchema,
    filterField: FieldPartialSchema,
}).partial();
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
            [FLAG.colSpan]: z.number().optional(),
            [FLAG.rowSpan]: z.number().optional(),
        })
    )
);

const tableConfigDefaults = {
    isSingleData: columnBooleanDefaults.disabled,
    fetchResultDataIndex: emptyString,

    dataGetApi: emptyString,
    dataCreateApi: emptyString,
    dataDeleteApi: emptyString,
    dataUpdateApi: emptyString,

    globalDependField: emptyString,

    cellSize: Z_TableCellSizes.enum.MEDIUM,
    creatable: columnBooleanDefaults.enabled,
    updatable: columnBooleanDefaults.enabled,
    deletable: columnBooleanDefaults.enabled,
    searchable: columnBooleanDefaults.enabled,
    isDashboard: false,
    loadable: false,
    highlightable: true,
    warningText: null,
    expandable: columnBooleanDefaults.enabled,
    editableTable: columnBooleanDefaults.enabled,
};

const TableConfigBaseSchema = z.object({
    isSingleData: z
        .boolean()
        .default(tableConfigDefaults.isSingleData.default)
        .catch(tableConfigDefaults.isSingleData.catch),
    fetchResultDataIndex: z
        .string()
        .default(tableConfigDefaults.fetchResultDataIndex)
        .catch(tableConfigDefaults.fetchResultDataIndex),

    dataGetApi: z.string().default(tableConfigDefaults.dataGetApi).catch(tableConfigDefaults.dataGetApi),
    dataCreateApi: z.string().default(tableConfigDefaults.dataCreateApi).catch(tableConfigDefaults.dataCreateApi),
    dataDeleteApi: z.string().default(tableConfigDefaults.dataDeleteApi).catch(tableConfigDefaults.dataDeleteApi),
    dataUpdateApi: z.string().default(tableConfigDefaults.dataUpdateApi).catch(tableConfigDefaults.dataUpdateApi),

    globalDependField: z.string().catch(tableConfigDefaults.globalDependField),

    cellSize: Z_TableCellSizes.default(tableConfigDefaults.cellSize).catch(tableConfigDefaults.cellSize),
    creatable: z.boolean().default(tableConfigDefaults.creatable.default).catch(tableConfigDefaults.creatable.catch),
    updatable: z.boolean().default(tableConfigDefaults.updatable.default).catch(tableConfigDefaults.updatable.catch),
    deletable: z.boolean().default(tableConfigDefaults.deletable.default).catch(tableConfigDefaults.deletable.catch),
    searchable: z.boolean().default(tableConfigDefaults.searchable.default).catch(tableConfigDefaults.searchable.catch),
    isDashboard: z.boolean().default(tableConfigDefaults.isDashboard).catch(tableConfigDefaults.isDashboard),
    loadable: z.boolean().default(tableConfigDefaults.loadable).catch(tableConfigDefaults.loadable),
    highlightable: z.boolean().default(tableConfigDefaults.highlightable).catch(tableConfigDefaults.highlightable),
    warningText: z.string().nullable().default(tableConfigDefaults.warningText).catch(tableConfigDefaults.warningText),
    expandable: z.boolean().default(tableConfigDefaults.expandable.default).catch(tableConfigDefaults.expandable.catch),
    editableTable: z
        .boolean()
        .default(tableConfigDefaults.editableTable.default)
        .catch(tableConfigDefaults.editableTable.catch),
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

export type PaginationConfigType = {
    hideTotal?: boolean;
    hideSizeChanger?: boolean;
    pageSizeOptions?: number[];
    hideTop?: boolean;
    hideBottom?: boolean;
    bottomPosition?: PaginationPositionType;
};

export type TableFilterItemType = {
    title: string;
    dataIndex: string;
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
    controllers: {
        create: string;
        get: string;
        choose: string;
        delete: string;
        setDefault: string;
        update: string;
    };
};

type FunctionModifier = { title: React.ReactNode; disabled?: boolean; icon?: React.ReactNode; onClick: () => void };

export type TableInitializationType = {
    tableTitle: string;
    configPath: string;
    loadingConfig?: {
        columnCount: number;
        rowCount?: number;
        noFuncBtnsLeft?: boolean;
        noFuncBtnsRight?: boolean;
    };
    paginationConfig?: PaginationConfigType;
    dataRefreshTrigger?: number;
    contentModifier?: { [key: string]: (record: GeneralObject) => React.ReactNode };
    functionModifier?: FunctionModifier[];
    userToken?: string;
    globalDependencies?: GeneralObject;
    data?: any[];
    hasAccessTo?: {
        create?: boolean;
        update?: boolean;
        delete?: boolean;
    };
};

export type PropsContextType = TableCreateType & TableInitializationType;

export type ComputedRowType = ColumnType[];

export type ComputedRowLevelType = {
    [Z_TablePinOptions.enum.LEFT]: ComputedRowType;
    [Z_TablePinOptions.enum.NONE]: ComputedRowType;
    [Z_TablePinOptions.enum.RIGHT]: ComputedRowType;
};

export type ComputedRowLevelsType = ComputedRowLevelType[];

export type ConfigBaseType = {
    configName: string;
    configParams: GeneralObject;
};

export type CreateConfigType = ConfigBaseType & {
    tableName: string;
};

export type UpdateConfigType = ConfigBaseType & {
    id: number;
    tableName: string;
};

export type ActionMenuType = {
    Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
        muiName: string;
    };
    text: string;
    value: string;
    color: string;
}[];
