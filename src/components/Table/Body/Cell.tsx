import { useContext, useRef } from "react";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import TableBodyContext from "../../../context/TableBodyContext";
import { formatDate, getColumnStyle, getDeepValue, getPinSide } from "../../../functions/global";
import { TableColumnType, Z_TableDataTypes, Z_TablePinOptions } from "../../../types/general";
import style from "../Table.module.scss";

const Cell = ({ column, order }: { column: TableColumnType; order: number }) => {
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);
    const bodyContext = useContext(TableBodyContext);

    const cellRef = useRef<HTMLTableCellElement>(null);
    const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

    const contentModifier = propsContext.contentModifier || {};
    const RENDER_PREFIX = "_$render$_";
    const isColumnModified = column.dataIndex.startsWith(RENDER_PREFIX);
    const ordinaryDataIndex = column.dataIndex.replace(RENDER_PREFIX, "");
    const modifiedContent = contentModifier[ordinaryDataIndex];

    let field = isColumnModified
        ? modifiedContent
        : ordinaryDataIndex.includes(".")
        ? getDeepValue(bodyContext.dataRow, ordinaryDataIndex)
        : bodyContext.dataRow[ordinaryDataIndex];

    if (column.dataType === Z_TableDataTypes.enum.DATE) field = formatDate(field);

    const getColumnClasses = (column: TableColumnType): string[] => {
        let columnClasses: string[] = [];

        if (stateContext.sortingColumn === column.dataIndex) columnClasses.push(style.sortColumn);
        if (isPinned) {
            columnClasses.push(style.pin);
            columnClasses.push(style[getPinSide(column.pin)]);
            if (
                column.pin === Z_TablePinOptions.enum.LEFT &&
                Math.max(
                    ...stateContext.tableColumnPins
                        .filter((tableColumnPin) => tableColumnPin.pin === column.pin)
                        .map((tableColumnPin) => tableColumnPin.order)
                ) === order
            ) {
                columnClasses.push(style.lastColumn);
            }
        } else if (order === 0) {
            columnClasses.push(style.firstColumn);
        }

        if (column.dataType === Z_TableDataTypes.enum.NUMBER) columnClasses.push(style.numericField);
        if (column.dataType !== Z_TableDataTypes.enum.STRING && column.dataType !== Z_TableDataTypes.enum.NUMBER)
            columnClasses.push(style.centeredField);

        return columnClasses;
    };

    return (
        <td
            ref={cellRef}
            key={`tableBody_${bodyContext.index}_${column.dataIndex}`}
            className={getColumnClasses(column).join(" ")}
            style={getColumnStyle(isPinned, column.pin, stateContext.tableColumnPins, order)}
        >
            {isColumnModified ? (
                field !== undefined ? (
                    field(bodyContext.dataRow)
                ) : (
                    <strong style={{ color: "red" }}>{`MODIFIER "${ordinaryDataIndex}" NOT PROVIDED`}</strong>
                )
            ) : (
                field
            )}
        </td>
    );
};

export default Cell;
