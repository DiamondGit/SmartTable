import { TableConfigType, TableColumnPin, TablePinOptions, Z_TablePinOptions } from "../types/general";

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

export const getPinOffset = (tableColumnPins: TableColumnPin[], pin: TablePinOptions, order: number): number => {
    const prevColumnPins = tableColumnPins.filter(
        (tableColumnPin) => tableColumnPin.pin === pin && (tableColumnPin.order || 0) < order
    );

    return prevColumnPins.reduce((widthSum, columnWidth) => widthSum + columnWidth.width, 0) || 0;
};

export const getColumnStyle = (
    isPinned: boolean,
    pin: TablePinOptions,
    tableColumnPins: TableColumnPin[],
    order: number
) => ({
    ...(isPinned
        ? {
              [getPinSide(pin)]: getPinOffset(tableColumnPins, pin, order) + order,
          }
        : {}),
});
