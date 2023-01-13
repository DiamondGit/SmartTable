import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useContext, useEffect, useRef } from "react";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { TableColumnType, Z_TablePinOptions, Z_TableSortOptions } from "../../../types/general";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";

const Cell = ({ column, order }: { column: TableColumnType; order: number }) => {
    const headContext = useContext(TableHeadContext);
    const stateContext = useContext(StateContext);
    const headingRef = useRef<HTMLTableCellElement>(null);
    const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;

    useEffect(() => {
        headContext.updateTableColumnWidth({
            dataIndex: column.dataIndex,
            pin: column.pin,
            order: order,
            width: headingRef.current?.clientWidth || 0,
        });
    }, [headingRef.current]);

    const columnStyle = {
        ...(isPinned
            ? {
                  [headContext.getPinSide(column.pin)]: headContext.getPinOffset(column.pin, order) + order,
              }
            : {}),
    };

    return (
        <th
            key={column.dataIndex}
            className={headContext.getColumnClasses(column, isPinned).join(" ")}
            onClick={headContext.handleClick(column.dataIndex)}
            ref={headingRef}
            style={columnStyle}
        >
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                {column.title}
                <div className={style.sortingArrow}>
                    {stateContext.sortingColumn === column.dataIndex && (
                        <>
                            {stateContext.sortingDirection === Z_TableSortOptions.enum.ASC ? (
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

export default Cell;
