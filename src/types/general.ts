import z from "zod";

interface UIBtnProps {
    loading?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

interface UICheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type UIBtnType = (props: UIBtnProps) => JSX.Element;
type UICheckBoxType = (props: UICheckboxProps) => JSX.Element;

export type TableUIStartingType = {
    PrimaryBtn?: UIBtnType;
    SecondaryBtn?: UIBtnType;
    OutlinedBtn?: UIBtnType;
    Checkbox?: UICheckBoxType;
};

export type TableUIType = {
    [Property in keyof TableUIStartingType]-?: TableUIStartingType[Property];
};

export interface TableInitializationType {
    tableTitle: string;
    tableName: string;
    userId: number;
    loadingConfig?: {
        columnCount: number;
        rowCount?: number;
        noFuncBtnsLeft?: boolean;
        noFuncBtnsRight?: boolean;
    };
}

export const Z_ModalTypes = z.enum(["ADD", "EDIT", "FILTER", "SETTINGS"]);
export type ModalTypes = z.infer<typeof Z_ModalTypes>;

export const Z_TableCellSizes = z.enum(["SMALL", "MEDIUM", "LARGE"]);
export type TableCellSizes = z.infer<typeof Z_TableCellSizes>;

export const Z_TableDataTypes = z.enum(["STRING", "NUMBER", "DATE", "BOOLEAN", "UNKNOWN"]);
export type TableDataTypes = z.infer<typeof Z_TableDataTypes>;

export const Z_TablePinOptions = z.enum(["LEFT", "NONE", "RIGHT"]);
export type TablePinOptions = z.infer<typeof Z_TablePinOptions>;

export const Z_TableSortOptions = z.enum(["ASC", "DESC"]);
export type TableSortOptions = z.infer<typeof Z_TableSortOptions>;

const TableColumnDefaults = {
    dataType: Z_TableDataTypes.enum.UNKNOWN,
    hidable: {
        default: true,
        catch: false,
    },
    pin: Z_TablePinOptions.enum.NONE,
    highlighted: false,
};

export const TableColumnSchema = z.object({
    title: z.string(),
    dataIndex: z.string(),
    dataType: Z_TableDataTypes.default(TableColumnDefaults.dataType).catch(TableColumnDefaults.dataType),
    visible: z.boolean(),
    hidable: z.boolean().default(TableColumnDefaults.hidable.default).catch(TableColumnDefaults.hidable.catch),
    pin: Z_TablePinOptions.default(TableColumnDefaults.pin).catch(TableColumnDefaults.pin),
    highlighted: z.boolean().default(TableColumnDefaults.highlighted).catch(TableColumnDefaults.highlighted),
});
export type TableColumnType = z.infer<typeof TableColumnSchema>;

const TableConfigDefaults = {
    cellSize: Z_TableCellSizes.enum.MEDIUM,
    editable: true,
    deletable: true,
    isDashboard: false,
    loadable: false,
    highlightable: true,
    warningText: null,
};

export const TableConfigSchema = z.object({
    table: z.array(TableColumnSchema),
    cellSize: Z_TableCellSizes.default(TableConfigDefaults.cellSize).catch(TableConfigDefaults.cellSize),
    editable: z.boolean().default(TableConfigDefaults.editable).catch(TableConfigDefaults.editable),
    deletable: z.boolean().default(TableConfigDefaults.deletable).catch(TableConfigDefaults.deletable),
    isDashboard: z.boolean().default(TableConfigDefaults.isDashboard).catch(TableConfigDefaults.isDashboard),
    loadable: z.boolean().default(TableConfigDefaults.loadable).catch(TableConfigDefaults.loadable),
    highlightable: z.boolean().default(TableConfigDefaults.highlightable).catch(TableConfigDefaults.highlightable),
    warningText: z.string().nullable().default(TableConfigDefaults.warningText).catch(TableConfigDefaults.warningText),
});
export type TableConfigType = z.infer<typeof TableConfigSchema> | undefined;

export type SavedTableConfigType = TableConfigType & { id: number; name: string; isRecent: boolean };
