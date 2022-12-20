import z from "zod";

export const Z_ModalTypes = z.enum(["ADD", "EDIT", "FILTER", "SETTINGS"]);
export type ModalTypes = z.infer<typeof Z_ModalTypes>;

export const Z_TableCellSizes = z.enum(["SMALL", "MEDIUM", "LARGE"]);
export type TableCellSizes = z.infer<typeof Z_TableCellSizes>;

export const TableColumnSchema = z.object({
    title: z.string(),
    dataIndex: z.string(),
    visible: z.boolean(),
    hidable: z.boolean().default(true).catch(false),
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
export type TableConfigType = z.infer<typeof TableConfigSchema>;

interface UIBtnProps {
    onClick?: () => void;
    loading?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
}

interface UICheckboxProps {
    checked?: boolean;
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