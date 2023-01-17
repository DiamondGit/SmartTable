import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useContext, useEffect, useRef } from "react";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { getColumnStyle, getPinSide } from "../../../functions/global";
import { TableColumnType, Z_TablePinOptions, Z_TableSortOptions } from "../../../types/general";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";

const Cell = ({ column, order }: { column: TableColumnType; order: number }) => {
    const headContext = useContext(TableHeadContext);
    const stateContext = useContext(StateContext);
    const headingRef = useRef<HTMLTableCellElement>(null);
    const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

    const updateCurrentColumnPin = () => {
        headContext.updateTableColumnPin({
            dataIndex: column.dataIndex,
            pin: column.pin,
            order: order,
            width: headingRef.current?.clientWidth || 0,
        });
    }

    useEffect(() => {
        updateCurrentColumnPin();
    }, [headingRef.current?.clientWidth, order]);

    useEffect(() => {
        window.addEventListener("resize", updateCurrentColumnPin);
        return () => {
            window.removeEventListener("resize", updateCurrentColumnPin);
        };
    }, []);

    const SortingIcon = () => {
        const props = {
            className: style.activeIcon,
            style: { fontSize: "20px" },
        };
        return stateContext.sortingDirection === Z_TableSortOptions.enum.ASC ? (
            <ArrowDownwardIcon {...props} />
        ) : (
            <ArrowUpwardIcon {...props} />
        );
    };

    const getColumnSortClass = (column: TableColumnType): string[] => {
        const defaultSortClass = [style.sortColumn];
        if (stateContext.sortingColumn !== column.dataIndex) return [];
        switch (stateContext.sortingDirection) {
            case Z_TableSortOptions.enum.ASC:
                defaultSortClass.push(style.asc);
                break;
            case Z_TableSortOptions.enum.DESC:
                defaultSortClass.push(style.desc);
                break;
            default:
                return [];
        }
        return defaultSortClass;
    };

    const getColumnClasses = (column: TableColumnType, isPinned: boolean): string[] => {
        let columnClasses: string[] = [];
        columnClasses = columnClasses.concat(getColumnSortClass(column));

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

        return columnClasses;
    };

    return (
        <th
            key={column.dataIndex}
            className={getColumnClasses(column, isPinned).join(" ")}
            onClick={headContext.handleClick(column.dataIndex)}
            ref={headingRef}
            style={getColumnStyle(isPinned, column.pin, stateContext.tableColumnPins, order)}
        >
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                {column.title}
                <div className={style.sortingArrow}>
                    {stateContext.sortingColumn === column.dataIndex && <SortingIcon />}
                </div>
            </Aligner>
        </th>
    );
};

export default Cell;
