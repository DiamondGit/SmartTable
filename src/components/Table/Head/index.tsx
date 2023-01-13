import { useContext, useEffect, useRef } from "react";
import ConfigContext from "../../../context/ConfigContext";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import {
    TableColumnType, TablePinOptions,
    TableSortOptions,
    Z_TablePinOptions,
    Z_TableSortOptions
} from "../../../types/general";
import style from "../Table.module.scss";
import SideColumns from "./SideColumns";

export interface TableColumnWidth {
    dataIndex: string;
    pin: TablePinOptions;
    order: number;
    width: number;
}

const Head = () => {
    const { tableConfig } = useContext(ConfigContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const tableColumnWidths = useRef<TableColumnWidth[]>([]);
    const stateContext = useContext(StateContext);

    useEffect(() => {
        updateTableColumnWidth({
            dataIndex: "_actionCell_",
            pin: Z_TablePinOptions.enum.LEFT,
            order: -1,
            width: stateContext.actionCellWidth,
        });
    }, [stateContext.actionCellWidth]);

    const handleClick = (dataIndex: string) => () => {
        const switchDirection = (sortingDirection: TableSortOptions): TableSortOptions => {
            switch (sortingDirection) {
                case Z_TableSortOptions.enum.ASC:
                    return Z_TableSortOptions.enum.DESC;
                case Z_TableSortOptions.enum.DESC:
                    stateContext.setSortingColumn("id");
                    return Z_TableSortOptions.enum.ASC;
            }
        };

        if (stateContext.sortingColumn !== dataIndex) {
            stateContext.setSortingColumn(dataIndex);
            stateContext.setSortingDirection(Z_TableSortOptions.enum.ASC);
        } else {
            stateContext.setSortingDirection(switchDirection(stateContext.sortingDirection));
        }
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
        }

        return columnClasses;
    };

    const updateTableColumnWidth = (tableColumnWidth: TableColumnWidth) => {
        let prevWidths = [...tableColumnWidths.current];
        if (prevWidths.some((prevWidth) => prevWidth.dataIndex === tableColumnWidth.dataIndex)) {
            prevWidths = prevWidths.filter((prevWidth) => prevWidth.dataIndex !== tableColumnWidth.dataIndex);
        }
        prevWidths.push(tableColumnWidth);

        tableColumnWidths.current = prevWidths;
    };

    const getPinSide = (pin: TablePinOptions): string => {
        if (pin === Z_TablePinOptions.enum.LEFT) return "left";
        return "right";
    };

    const getPinOffset = (pin: TablePinOptions, order: number): number => {
        return (
            tableColumnWidths.current
                .filter(
                    (tableColumnWidth) =>
                        tableColumnWidth.pin === pin &&
                        (pin === Z_TablePinOptions.enum.LEFT
                            ? tableColumnWidth.order < order
                            : tableColumnWidth.order > order)
                )
                .reduce((widthSum, columnWidth) => widthSum + columnWidth.width, 0) || 0
        );
    };

    const hasLeftPin = tableConfig?.table.some((column) => column.pin === Z_TablePinOptions.enum.LEFT) || false;

    return (
        <TableHeadContext.Provider
            value={{
                updateTableColumnWidth: updateTableColumnWidth,
                getPinSide: getPinSide,
                getPinOffset: getPinOffset,
                getColumnClasses: getColumnClasses,
                handleClick: handleClick,
            }}
        >
            <th
                className={style.actionCell}
                style={hasLeftPin ? { position: "sticky", left: 0, zIndex: 100 } : {}}
                ref={actionCellRef}
            ></th>
            <SideColumns pinOption={Z_TablePinOptions.enum.LEFT} />
            <SideColumns />
            <SideColumns pinOption={Z_TablePinOptions.enum.RIGHT} />
        </TableHeadContext.Provider>
    );
};

export default Head;
