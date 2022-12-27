import {
    TableColumnType,
    TableConfigType,
    TablePinOptions,
    TableSortOptions,
    Z_TablePinOptions,
    Z_TableSortOptions,
} from "../../types/general";
import style from "./Table.module.scss";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Aligner from "../Aligner";
import { useContext, useEffect, useRef } from "react";
import TableStateContext from "../../context/TableStateContext";

interface TableColumnWidth {
    dataIndex: string;
    pin: TablePinOptions;
    order: number;
    width: number;
}

const TableHead = ({ tableConfig }: { tableConfig: TableConfigType | null }) => {
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const tableColumnWidths = useRef<TableColumnWidth[]>([]);
    const tableStateContext = useContext(TableStateContext);

    useEffect(() => {
        updateTableColumnWidth({
            dataIndex: "_actionCell_",
            pin: Z_TablePinOptions.enum.LEFT,
            order: -1,
            width: tableStateContext.actionCellWidth,
        })
    }, [tableStateContext.actionCellWidth])

    const handleClick = (dataIndex: string) => () => {
        const switchDirection = (sortingDirection: TableSortOptions): TableSortOptions => {
            switch (sortingDirection) {
                case Z_TableSortOptions.enum.ASC:
                    return Z_TableSortOptions.enum.DESC;
                case Z_TableSortOptions.enum.DESC:
                    tableStateContext.setSortingColumn("id");
                    return Z_TableSortOptions.enum.ASC;
            }
        };

        if (tableStateContext.sortingColumn !== dataIndex) {
            tableStateContext.setSortingColumn(dataIndex);
            tableStateContext.setSortingDirection(Z_TableSortOptions.enum.ASC);
        } else {
            tableStateContext.setSortingDirection(switchDirection(tableStateContext.sortingDirection));
        }
    };

    const getColumnSortClass = (column: TableColumnType): string[] => {
        const defaultSortClass = [style.sortColumn];
        if (tableStateContext.sortingColumn !== column.dataIndex) return [];
        switch (tableStateContext.sortingDirection) {
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
                .filter((tableColumnWidth) => tableColumnWidth.pin === pin && (pin === Z_TablePinOptions.enum.LEFT ? tableColumnWidth.order < order : tableColumnWidth.order > order))
                .reduce((widthSum, columnWidth) => widthSum + columnWidth.width, 0) || 0
        );
    };

    const hasLeftPin = tableConfig?.table.some((column) => column.pin === Z_TablePinOptions.enum.LEFT) || false;

    const Heading = ({ column, order }: { column: TableColumnType; order: number }) => {
        const headingRef = useRef<HTMLTableCellElement>(null);
        const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

        useEffect(() => {
            updateTableColumnWidth({
                dataIndex: column.dataIndex,
                pin: column.pin,
                order: order,
                width: headingRef.current?.clientWidth || 0,
            });
        }, [headingRef.current]);

        const columnStyle = {
            ...(isPinned
                ? {
                      [getPinSide(column.pin)]:
                          getPinOffset(column.pin, order) + order,
                  }
                : {}),
        };

        return (
            <th
                key={column.dataIndex}
                className={getColumnClasses(column, isPinned).join(" ")}
                onClick={handleClick(column.dataIndex)}
                ref={headingRef}
                style={columnStyle}
            >
                <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                    {column.title}
                    <div className={style.sortingArrow}>
                        {tableStateContext.sortingColumn === column.dataIndex && (
                            <>
                                {tableStateContext.sortingDirection === Z_TableSortOptions.enum.ASC ? (
                                    <ArrowDownwardIcon className={style.activeIcon} style={{ fontSize: "20px" }} />
                                ) : (
                                    <ArrowUpwardIcon className={style.activeIcon} style={{ fontSize: "20px" }} />
                                )}
                            </>
                        )}
                    </div>
                </Aligner>
            </th>
        );
    };

    const SideColumns = ({ pinOption = Z_TablePinOptions.enum.NONE }: { pinOption?: TablePinOptions }) => {
        if (!tableConfig) return null;
        return (
            <>
                {tableConfig.table
                    .filter((column) => (!column.hidable || column.visible) && column.pin === pinOption)
                    .map((column, index) => (
                        <Heading column={column} order={index} key={index} />
                    ))}
            </>
        );
    };

    return (
        <>
            <th className={style.actionCell} style={hasLeftPin ? {position: "sticky", left: 0, zIndex: 100 } : {}} ref={actionCellRef}></th>
            <SideColumns pinOption={Z_TablePinOptions.enum.LEFT} />
            <SideColumns />
            <SideColumns pinOption={Z_TablePinOptions.enum.RIGHT} />
        </>
    );
};

export default TableHead;
