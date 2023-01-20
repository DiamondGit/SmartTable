import { INDEX_JOINER } from "../constants/general";
import { TablePinOptions, Z_TablePinOptions } from "../types/enums";
import { BodyColumnPin, ColumnType } from "../types/general";

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

export const getPinOffset = (columnPins: BodyColumnPin[], pin: TablePinOptions, order: number): number => {
    const prevColumnPins = columnPins.filter((columnPin) => columnPin.pin === pin && columnPin.order < order);
    return prevColumnPins.reduce((widthSum, columnWidth) => widthSum + columnWidth.width, 0) || 0;
};

export const getColumnStyle = (
    isPinned: boolean,
    pin: TablePinOptions,
    columnPins: BodyColumnPin[],
    order: number
) => ({
    ...(isPinned
        ? {
              [getPinSide(pin)]: getPinOffset(columnPins, pin, order) + order,
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
