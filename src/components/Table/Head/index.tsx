import { useContext, useEffect, useRef, useState } from "react";
import { ACTION_COLUMN_NAME, FLAG } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import DataFetchContext from "../../../context/DataFetchContext";
import FilterContext from "../../../context/FilterContext";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { SortOptions, Z_SortOptions, Z_TablePinOptions } from "../../../types/enums";
import { ColumnPinType, ColumnType, ComputedRowLevelsType } from "../../../types/general";
import style from "../Table.module.scss";
import Row from "./Row";

const Head = () => {
    const { tableConfig, hasLeftPin } = useContext(ConfigContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const stateContext = useContext(StateContext);
    const dataFetchContext = useContext(DataFetchContext);
    const filterContext = useContext(FilterContext);

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
        dataFetchContext.getData({
            ...filterContext.queryProps,
            sortField: sortingColumn,
            sortDir: sortingDirection,
        });
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
