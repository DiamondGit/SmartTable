import z from "zod";

export const Z_ModalTypes = z.enum(["ADD", "EDIT", "FILTER", "SETTINGS"]);
export type ModalTypes = z.infer<typeof Z_ModalTypes>;

export const Z_TableCellSizes = z.enum(["SMALL", "MEDIUM", "LARGE"]);
export type TableCellSizes = z.infer<typeof Z_TableCellSizes>;

export const Z_TableDataTypes = z.enum(["STRING", "NUMBER", "DATE", "BOOLEAN", "OTHER"]);
export type TableDataTypes = z.infer<typeof Z_TableDataTypes>;

export const Z_TablePinOptions = z.enum(["LEFT", "NONE", "RIGHT"]);
export type TablePinOptions = z.infer<typeof Z_TablePinOptions>;

export const Z_SortOptions = z.enum(["ASC", "DESC"]);
export type SortOptions = z.infer<typeof Z_SortOptions>;

export const Z_TableFilterTypes = z.enum(["SELECT", "TEXT", "DATE", "CONDITION", "BOOLEAN", "NONE"]);
export type TableFilterTypes = z.infer<typeof Z_TableFilterTypes>;

export const Z_PaginationPositions = z.enum(["LEFT", "CENTER", "RIGHT"]);
export type PaginationPositionType = z.infer<typeof Z_PaginationPositions>;

export const Z_FilterHighlights = z.enum(["WARNING", "HIGHLIGHT"]);
export type TableFilterHighlightType = {
    type: z.infer<typeof Z_FilterHighlights>;
    filterIds: number[];
};