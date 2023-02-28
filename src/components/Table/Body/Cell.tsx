import { useContext, useRef } from "react";
import { FLAG } from "../../../constants/general";
import { ErrorText, TableDataSkeleton } from "../../../constants/UI";
import DataFetchContext from "../../../context/DataFetchContext";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import TableBodyContext from "../../../context/TableBodyContext";
import { formatDate, getColumnStyle, getDeepValue, getPinSide } from "../../../functions/global";
import { Z_TableDataTypes, Z_TablePinOptions } from "../../../types/enums";
import { ColumnPinType, ColumnType } from "../../../types/general";
import style from "../Table.module.scss";

type BodyCellType = { column: ColumnType; order: number };

const Cell = ({ column, order }: BodyCellType) => {
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);
    const bodyContext = useContext(TableBodyContext);
    const dataFetchContext = useContext(DataFetchContext);

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
                Math.max(
                    ...stateContext.columnPins
                        .filter((tableColumnPin) => tableColumnPin.pin === targetColumn.pin)
                        .map((tableColumnPin) => tableColumnPin.order)
                ) === order
            ) {
                if (targetColumn.pin === Z_TablePinOptions.enum.LEFT) {
                    columnClasses.push(style.lastPinnedLeftColumn);
                } else if (targetColumn.pin === Z_TablePinOptions.enum.RIGHT) {
                    columnClasses.push(style.lastPinnedRightColumn);
                }
            }
        } else if (order === 0) {
            columnClasses.push(style.firstColumn);
        }

        if (targetColumn.dataType === Z_TableDataTypes.enum.NUMBER) columnClasses.push(style.numericField);
        if (targetColumn.dataType !== Z_TableDataTypes.enum.TEXT && targetColumn.dataType !== Z_TableDataTypes.enum.NUMBER)
            columnClasses.push(style.centeredField);

        return columnClasses;
    };

    return (
        <td
            ref={cellRef}
            className={getColumnClasses(column).join(" ")}
            style={getColumnStyle(isPinned, column.pin, stateContext.columnPins, column[FLAG.namedDataIndex])}
        >
            {
                !dataFetchContext.isDataLoading ?
                    column.modifiableContent ? (
                        field !== undefined ? (
                            field(bodyContext.dataRow)
                        ) : (
                            <ErrorText text={`Отсутствует модификатор для ячейки ${column[FLAG.path]}`} />
                        )
                    ) : (
                        field
                    )
                    :
                    <TableDataSkeleton dataType={column.dataType} />
            }
        </td>
    );
};

export default Cell;
