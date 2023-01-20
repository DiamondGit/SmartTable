import { useContext, useRef } from "react";
import { FLAG } from "../../../constants/general";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import TableBodyContext from "../../../context/TableBodyContext";
import { formatDate, getColumnStyle, getDeepValue, getPinSide } from "../../../functions/global";
import { Z_TableDataTypes, Z_TablePinOptions } from "../../../types/enums";
import { BodyColumnPin, ColumnType } from "../../../types/general";
import style from "../Table.module.scss";

type BodyCellType = { column: ColumnType; order: number };

const Cell = ({ column, order }: BodyCellType) => {
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);
    const bodyContext = useContext(TableBodyContext);

    const cellRef = useRef<HTMLTableCellElement>(null);
    const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

    const contentModifier = propsContext.contentModifier || {};

    let field = column[FLAG.path]
        ? column.modifiableContent
            ? contentModifier[column[FLAG.path]]
            : getDeepValue(bodyContext.dataRow, column[FLAG.path])
        : null;

    if (column.dataType === Z_TableDataTypes.enum.DATE) field = formatDate(field);

    const getColumnClasses = (targetColumn: ColumnType): string[] => {
        let columnClasses: string[] = [];

        if (stateContext.sortingColumn === targetColumn[FLAG.path]) columnClasses.push(style.sortColumn);
        if (isPinned) {
            columnClasses.push(style.pin);
            columnClasses.push(style[getPinSide(targetColumn.pin)]);
            if (
                targetColumn.pin === Z_TablePinOptions.enum.LEFT &&
                Math.max(
                    ...stateContext.columnPins
                        .filter((tableColumnPin) => tableColumnPin.pin === targetColumn.pin)
                        .map((tableColumnPin) => tableColumnPin.order)
                ) === order
            ) {
                columnClasses.push(style.lastColumn);
            }
        } else if (order === 0) {
            columnClasses.push(style.firstColumn);
        }

        if (targetColumn.dataType === Z_TableDataTypes.enum.NUMBER) columnClasses.push(style.numericField);
        if (targetColumn.dataType !== Z_TableDataTypes.enum.STRING && targetColumn.dataType !== Z_TableDataTypes.enum.NUMBER)
            columnClasses.push(style.centeredField);

        return columnClasses;
    };

    return (
        <td
            ref={cellRef}
            className={getColumnClasses(column).join(" ")}
            style={getColumnStyle(isPinned, column.pin, stateContext.columnPins, order)}
        >
            {column.modifiableContent ? (
                field !== undefined ? (
                    field(bodyContext.dataRow)
                ) : (
                    <strong style={{ color: "red" }}>{`MODIFIER "${column[FLAG.path]}" NOT PROVIDED`}</strong>
                )
            ) : (
                field
            )}
        </td>
    );
};

export default Cell;
