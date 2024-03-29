import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { MouseEventHandler, useContext, useEffect, useRef, useState } from "react";
import { FLAG } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import DataFetchContext from "../../../context/DataFetchContext";
import PaginationContext from "../../../context/PaginationContext";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { getColumnStyle, getPinSide } from "../../../functions/global";
import { Z_SortOptions, Z_TablePinOptions } from "../../../types/enums";
import { ColumnType, GeneralObject } from "../../../types/general";
import style from "../Table.module.scss";

type HeadCellType = { column: ColumnType; order: number };

const Cell = ({ column, order }: HeadCellType) => {
    const headContext = useContext(TableHeadContext);
    const stateContext = useContext(StateContext);
    const paginationContext = useContext(PaginationContext);
    const dataContext = useContext(DataContext);
    const configContext = useContext(ConfigContext);
    const dataFetchContext = useContext(DataFetchContext);
    const headingRef = useRef<HTMLTableCellElement>(null);
    const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

    const [localColumnWidthRefreshTrigger, setLocalColumnWidthRefreshTrigger] = useState(
        dataFetchContext.columnWidthRefreshTrigger
    );

    const columnRefreshDependencies = [
        configContext.tableConfig,
        configContext.selectedSavedConfigId,
        configContext.selectedSavedTableConfigId,
        dataFetchContext.data,
        dataFetchContext.isDataLoading,
        dataFetchContext.columnWidthRefreshTrigger,
        dataContext.isFullscreen,
        headingRef.current?.getClientRects()[0].width,
        order,
    ];

    useEffect(() => {
        setLocalColumnWidthRefreshTrigger(Date.now());
    }, columnRefreshDependencies);

    const updateColumnWidth = () => {
        const computedData = {
            namedDataIndex: column[FLAG.namedDataIndex],
            order: order,
            mainOrder: column[FLAG.mainOrder],
            pin: column.pin,
            level: column[FLAG.rowLevel],
            width: headingRef.current?.getClientRects()[0].width || 0,
        };

        if (
            !stateContext.columnPins.some((columnPin) => columnPin.namedDataIndex === column[FLAG.namedDataIndex]) &&
            !!headingRef.current?.getClientRects()[0].width
        ) {
            headContext.addOrReplaceColumnPin(computedData);
        } else {
            headContext.updateColumnPin(computedData);
        }
    };

    useEffect(() => {
        window.addEventListener("resize", updateColumnWidth);
        return () => {
            window.removeEventListener("resize", updateColumnWidth);
        };
    }, []);

    useEffect(() => {
        updateColumnWidth();
    }, [...columnRefreshDependencies, localColumnWidthRefreshTrigger]);

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

    const getColumnClasses = (targetColumn: ColumnType, isPinned: boolean, isDataError: boolean): string[] => {
        let columnClasses: string[] = [];
        columnClasses = columnClasses.concat(getColumnSortClass(targetColumn));

        if (targetColumn.sortable && !isDataError && !dataContext.isSelectingToDelete) columnClasses.push(style.sortable);
        if (targetColumn.subcolumns) columnClasses.push(style.withSubcolumn);
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
        return columnClasses;
    };

    const computedSpan: GeneralObject = {};
    if (column[FLAG.colSpan] !== 1) computedSpan.colSpan = column[FLAG.colSpan];
    if (column[FLAG.rowSpan] !== 1) computedSpan.rowSpan = column[FLAG.rowSpan];

    const handleClick: MouseEventHandler | undefined = (event: React.MouseEvent) => {
        if (
            column.subcolumns ||
            !column.dataIndex ||
            !column.sortable ||
            dataFetchContext.isDataError ||
            dataContext.isSelectingToDelete
        )
            return;
        headContext.handleClick(column[FLAG.path])(event);
    };

    return (
        <th
            key={column[FLAG.namedDataIndex]}
            className={getColumnClasses(column, isPinned, dataFetchContext.isDataError || false).join(" ")}
            onClick={handleClick}
            ref={headingRef}
            style={getColumnStyle(isPinned, column.pin, stateContext.columnPins, column[FLAG.namedDataIndex])}
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
