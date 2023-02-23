import z from "zod";

export const Z_ModalTypes = z.enum(["ADD", "ADD_BASED", "EDIT", "FILTER", "SETTINGS"]);
export type ModalTypes = z.infer<typeof Z_ModalTypes>;

export const Z_TableCellSizes = z.enum(["SMALL", "MEDIUM", "LARGE"]);
export type TableCellSizes = z.infer<typeof Z_TableCellSizes>;

export const Z_TableDataTypes = z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN", "OTHER"]);
export type TableDataTypes = z.infer<typeof Z_TableDataTypes>;

export const Z_TablePinOptions = z.enum(["LEFT", "NONE", "RIGHT"]);
export type TablePinOptions = z.infer<typeof Z_TablePinOptions>;

export const Z_SortOptions = z.enum(["ASC", "DESC"]);
export type SortOptions = z.infer<typeof Z_SortOptions>;

export const Z_TableFieldTypes = z.enum(["SELECT", "MULTISELECT", "TEXT", "NUMBER", "DATE", "CONDITION", "BOOLEAN", "NONE"]);
export type TableFieldTypes = z.infer<typeof Z_TableFieldTypes>;

export const Z_PaginationPositions = z.enum(["LEFT", "CENTER", "RIGHT"]);
export type PaginationPositionType = z.infer<typeof Z_PaginationPositions>;

export const Z_FilterHighlights = z.enum(["WARNING", "HIGHLIGHT"]);
export type TableFilterHighlightType = {
    type: z.infer<typeof Z_FilterHighlights>;
    filterIds: number[];
};

export const Z_DependencyActions = z.enum(["FETCH", "SHOW", "HIDE", "RESET"]);
export type DependencyActionType = z.infer<typeof Z_DependencyActions>;

export const Z_DependencyTypes = z.enum(["INDEP", "PARTIAL", "FULL"]);
export type DependencyType = z.infer<typeof Z_DependencyTypes>;
