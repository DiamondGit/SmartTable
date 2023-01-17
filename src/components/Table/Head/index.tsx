import { useContext, useEffect, useRef } from "react";
import ConfigContext from "../../../context/ConfigContext";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import {
    TableColumnPin,
    TableSortOptions,
    Z_TablePinOptions,
    Z_TableSortOptions,
} from "../../../types/general";
import SideColumns from "../SideColumns";
import style from "../Table.module.scss";

const Head = () => {
    const { hasLeftPin } = useContext(ConfigContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const stateContext = useContext(StateContext);

    useEffect(() => {
        addOrReplaceTableColumnPin({
            dataIndex: "_actionCell_",
            pin: Z_TablePinOptions.enum.LEFT,
            order: -1,
            width: actionCellRef.current?.clientWidth || 0,
        });
    }, [actionCellRef.current?.clientWidth]);

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

    const addOrReplaceTableColumnPin = (targetColumn: TableColumnPin) => {
        stateContext.setTableColumnPins((prevColumnPins) => {
            prevColumnPins = prevColumnPins.filter(
                (prevColumnPin) => prevColumnPin.dataIndex !== targetColumn.dataIndex
            );
            prevColumnPins.push(targetColumn);
            return prevColumnPins;
        });
    };

    const updateTableColumnPin = (targetColumn: TableColumnPin) => {
        stateContext.setTableColumnPins((prevColumnPins) => {
            prevColumnPins = prevColumnPins.filter(
                (prevColumnPin) => prevColumnPin.dataIndex !== targetColumn.dataIndex
            );
            prevColumnPins.push(targetColumn);

            Object.values(Z_TablePinOptions.enum).forEach((pinOption) => {
                let index = 0;
                prevColumnPins.map((column) => {
                    if (column.pin === pinOption) {
                        return { ...column, order: index++ };
                    }
                    return column;
                });
            });

            return prevColumnPins;
        });
    };

    const actionCellClasses = [style.actionCell];
    if (hasLeftPin) actionCellClasses.push(style.withLeftPin);

    return (
        <TableHeadContext.Provider
            value={{
                updateTableColumnPin: updateTableColumnPin,
                handleClick: handleClick,
            }}
        >
            <th
                className={actionCellClasses.join(" ")}
                ref={actionCellRef}
            ></th>
            <SideColumns pinOption={Z_TablePinOptions.enum.LEFT} isHead />
            <SideColumns isHead />
            <SideColumns pinOption={Z_TablePinOptions.enum.RIGHT} isHead />
        </TableHeadContext.Provider>
    );
};

export default Head;
