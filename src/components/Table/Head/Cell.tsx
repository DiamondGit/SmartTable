import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useContext, useEffect, useRef, MouseEventHandler } from "react";
import { FLAG } from "../../../constants/general";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { getColumnStyle, getPinSide } from "../../../functions/global";
import { Z_TablePinOptions, Z_SortOptions } from "../../../types/enums";
import { ColumnType } from "../../../types/general";
import style from "../Table.module.scss";

type HeadCellType = { column: ColumnType; order: number };

const Cell = ({ column, order }: HeadCellType) => {
    const headContext = useContext(TableHeadContext);
    const stateContext = useContext(StateContext);
    const headingRef = useRef<HTMLTableCellElement>(null);
    const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

    const updateCurrentColumnPin = () => {
        headContext.updateColumnPin({
            name: column[FLAG.namedDataIndex],
            order: order,
            pin: column.pin,
            width: headingRef.current?.clientWidth || 0,
        });
    };

    useEffect(() => {
        if (column[FLAG.rowLevel] === 1) {
            updateCurrentColumnPin();
        }
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
        return stateContext.sortingDirection === Z_SortOptions.enum.ASC ? (
            <ArrowDownwardIcon {...props} />
        ) : (
            <ArrowUpwardIcon {...props} />
        );
    };

    const getColumnSortClass = (targetColumn: ColumnType): string[] => {
        const defaultSortClass = [style.sortColumn];
        if (stateContext.sortingColumn !== targetColumn[FLAG.path] || targetColumn.subcolumns) return [];
        switch (stateContext.sortingDirection) {
            case Z_SortOptions.enum.ASC:
                defaultSortClass.push(style.asc);
                break;
            case Z_SortOptions.enum.DESC:
                defaultSortClass.push(style.desc);
                break;
            default:
                return [];
        }
        return defaultSortClass;
    };

    const getColumnClasses = (targetColumn: ColumnType, isPinned: boolean): string[] => {
        let columnClasses: string[] = [];
        columnClasses = columnClasses.concat(getColumnSortClass(targetColumn));

        if (targetColumn.sortable) columnClasses.push(style.sortable);
        if (targetColumn.subcolumns) columnClasses.push(style.withSubcolumn);
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

        return columnClasses;
    };

    const computedSpan: { [key: string]: any } = {};
    if (column[FLAG.colSpan] !== 1) computedSpan.colSpan = column[FLAG.colSpan];
    if (column[FLAG.rowSpan] !== 1) computedSpan.rowSpan = column[FLAG.rowSpan];

    const handleClick: MouseEventHandler | undefined = (event: React.MouseEvent) => {
        if (column.subcolumns || !column.dataIndex) return;
        headContext.handleClick(column[FLAG.path])(event);
    };

    return (
        <th
            key={column[FLAG.namedDataIndex]}
            className={getColumnClasses(column, isPinned).join(" ")}
            onClick={handleClick}
            ref={headingRef}
            style={getColumnStyle(isPinned, column.pin, stateContext.columnPins, order)}
            {...computedSpan}
        >
            <div>
                {column.title}
                <div className={style.sortingArrow}>
                    {stateContext.sortingColumn === column[FLAG.path] && <SortingIcon />}
                </div>
            </div>
        </th>
    );
};

export default Cell;
