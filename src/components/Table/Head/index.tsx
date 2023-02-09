import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { ColumnPinType, ColumnType, ComputedRowLevelsType, ComputedRowLevelType } from "../../../types/general";
import { SortOptions, Z_TablePinOptions, Z_SortOptions } from "../../../types/enums";
import style from "../Table.module.scss";
import Side from "./Side";
import { ACTION_COLUMN_NAME, FLAG } from "../../../constants/general";
import { joinIndexes } from "../../../functions/global";
import Row from "./Row";
import PaginationContext from "../../../context/PaginationContext";
import PropsContext from "../../../context/PropsContext";

const Head = () => {
    const { tableConfig, hasLeftPin } = useContext(ConfigContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const stateContext = useContext(StateContext);
    const paginationContext = useContext(PaginationContext);
    const propsContext = useContext(PropsContext);

    const defaultRowLevels: ComputedRowLevelsType = [];
    const [computedRowLevels, setComputedRowLevels] = useState<ComputedRowLevelsType>(defaultRowLevels);

    useEffect(() => {
        addOrReplaceColumnPin({
            namedDataIndex: ACTION_COLUMN_NAME,
            order: -1,
            mainOrder: -1,
            pin: Z_TablePinOptions.enum.LEFT,
            level: 0,
            width: actionCellRef.current?.getClientRects()[0].width || 0,
        });
    }, [actionCellRef.current?.getClientRects()[0].width]);

    const getHeadingByLevel = (column: ColumnType, level: number): ColumnType | ColumnType[] => {
        if (column[FLAG.rowLevel] === level) return column;

        if (column.subcolumns) {
            let tempResult: ColumnType[] = [];

            column.subcolumns.forEach((subcolumn) => {
                tempResult = tempResult.concat(getHeadingByLevel(subcolumn, level));
            });

            return tempResult;
        }
        return [];
    };

    useEffect(() => {
        if (!tableConfig?.table) return;
        setComputedRowLevels(() => {
            const result: ComputedRowLevelsType = [...defaultRowLevels];

            Object.values(Z_TablePinOptions.enum).forEach((pinOption) => {
                const resultRowColumns = tableConfig.table.filter(
                    (column) => (!column.hidable || column.visible) && column.pin === pinOption
                );

                [...Array(stateContext.maxHeadingDepth)].forEach((_, rowLevel) => {
                    let rowSideColumns: ColumnType[] = [];
                    resultRowColumns.forEach((column) => {
                        rowSideColumns = rowSideColumns.concat(getHeadingByLevel(column, rowLevel));
                    });
                    result[rowLevel] = {
                        ...(result[rowLevel] || {}),
                        [pinOption]: rowSideColumns,
                    };
                });
            });

            return result;
        });
    }, [tableConfig?.table]);

    const updateSort = (sortingColumn: string, sortingDirection: SortOptions = Z_SortOptions.enum.ASC) => {
        stateContext.setSortingColumn(sortingColumn);
        stateContext.setSortingDirection(sortingDirection);
        propsContext.paginationConfig?.getData?.(
            paginationContext.currentPage,
            paginationContext.pageSize,
            sortingColumn,
            sortingDirection
        );
    };

    const handleClick = (dataIndex: string | undefined) => () => {
        if (!dataIndex) return;
        const switchDirection = (sortingDirection: SortOptions): void => {
            switch (sortingDirection) {
                case Z_SortOptions.enum.ASC:
                    updateSort(stateContext.sortingColumn, Z_SortOptions.enum.DESC);
                    break;
                case Z_SortOptions.enum.DESC:
                    updateSort("id");

                    // stateContext.setSortingColumn("id");
                    break;
            }
        };

        if (stateContext.sortingColumn !== dataIndex) {
            updateSort(dataIndex);
        } else {
            switchDirection(stateContext.sortingDirection);
        }
    };

    const addOrReplaceColumnPin = (targetColumn: ColumnPinType) => {
        stateContext.setColumnPins((prevColumnPins) => {
            prevColumnPins = prevColumnPins.filter(
                (prevColumnPin) => prevColumnPin.namedDataIndex !== targetColumn.namedDataIndex
            );
            prevColumnPins.push(targetColumn);
            return prevColumnPins;
        });
    };

    const updateColumnPin = (targetColumn: ColumnPinType) => {
        stateContext.setColumnPins((prevColumnPins) => {
            let newColumnPins = [...prevColumnPins];
            newColumnPins = newColumnPins.map((columnPin) =>
                columnPin.namedDataIndex === targetColumn.namedDataIndex ? targetColumn : columnPin
            );

            return newColumnPins;
        });
    };

    const actionCellClasses = [style.actionCell];
    if (hasLeftPin) actionCellClasses.push(style.withLeftPin);
    return (
        <TableHeadContext.Provider
            value={{
                updateColumnPin,
                addOrReplaceColumnPin,
                handleClick,
            }}
        >
            {computedRowLevels.map((rowLevel, level) => (
                <Row level={level} rowLevel={rowLevel} key={level} actionCellRef={actionCellRef} />
            ))}
        </TableHeadContext.Provider>
    );
};

export default Head;
