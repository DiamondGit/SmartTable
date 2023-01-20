import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import StateContext from "../../../context/StateContext";
import TableHeadContext from "../../../context/TableHeadContext";
import { BodyColumnPin, ColumnType } from "../../../types/general";
import { SortOptions, Z_TablePinOptions, Z_SortOptions } from "../../../types/enums";
import style from "../Table.module.scss";
import Side from "./Side";
import { ACTION_COLUMN_NAME, FLAG } from "../../../constants/general";
import { joinIndexes } from "../../../functions/global";

type ComputedColumnLevelsType = {
    [Z_TablePinOptions.enum.LEFT]: ColumnType[][];
    [Z_TablePinOptions.enum.NONE]: ColumnType[][];
    [Z_TablePinOptions.enum.RIGHT]: ColumnType[][];
};

const Head = () => {
    const { tableConfig, hasLeftPin } = useContext(ConfigContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const stateContext = useContext(StateContext);

    const defaultColumnLevels: ComputedColumnLevelsType = {
        [Z_TablePinOptions.enum.LEFT]: [],
        [Z_TablePinOptions.enum.NONE]: [],
        [Z_TablePinOptions.enum.RIGHT]: [],
    };

    const [computedColumnLevels, setComputedColumnLevels] = useState<ComputedColumnLevelsType>(defaultColumnLevels);

    useEffect(() => {
        addOrReplaceColumnPin({
            name: ACTION_COLUMN_NAME,
            order: -1,
            pin: Z_TablePinOptions.enum.LEFT,
            width: actionCellRef.current?.clientWidth || 0,
        });
    }, [actionCellRef.current?.clientWidth]);

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
        setComputedColumnLevels(() => {
            const result = { ...defaultColumnLevels };
            const defaultLevelResult: ColumnType[][] = [...Array(stateContext.maxHeadingDepth)].map(() => []);
            Object.values(Z_TablePinOptions.enum).forEach((pinOption) => {
                const resultColumns = tableConfig.table.filter(
                    (column) => (!column.hidable || column.visible) && column.pin === pinOption
                );

                const levelResult = [...defaultLevelResult];
                for (let i = 0; i < levelResult.length; i++) {
                    let tempLevel: ColumnType[] = [];
                    resultColumns.forEach((column) => {
                        tempLevel = tempLevel.concat(getHeadingByLevel(column, i + 1));
                    });
                    levelResult[i] = tempLevel;
                }
                result[pinOption] = levelResult;
            });
            return result;
        });
    }, [tableConfig]);

    const handleClick = (dataIndex: string | undefined) => () => {
        if (!dataIndex) return;
        const switchDirection = (sortingDirection: SortOptions): SortOptions => {
            switch (sortingDirection) {
                case Z_SortOptions.enum.ASC:
                    return Z_SortOptions.enum.DESC;
                case Z_SortOptions.enum.DESC:
                    stateContext.setSortingColumn("id");
                    return Z_SortOptions.enum.ASC;
            }
        };

        if (stateContext.sortingColumn !== dataIndex) {
            stateContext.setSortingColumn(dataIndex);
            stateContext.setSortingDirection(Z_SortOptions.enum.ASC);
        } else {
            stateContext.setSortingDirection(switchDirection(stateContext.sortingDirection));
        }
    };

    const addOrReplaceColumnPin = (targetColumn: BodyColumnPin) => {
        stateContext.setColumnPins((prevColumnPins) => {
            prevColumnPins = prevColumnPins.filter((prevColumnPin) => prevColumnPin.name !== targetColumn.name);
            prevColumnPins.push(targetColumn);
            return prevColumnPins;
        });
    };

    const updateColumnPin = (targetColumn: BodyColumnPin) => {
        stateContext.setColumnPins((prevColumnPins) => {
            prevColumnPins = prevColumnPins.filter((prevColumnPin) => prevColumnPin.name !== targetColumn.name);
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
                updateColumnPin,
                handleClick,
            }}
        >
            {[...Array(stateContext.maxHeadingDepth)].map((_, index) => (
                <tr key={index} style={{ position: "relative", zIndex: stateContext.maxHeadingDepth - index }}>
                    {index === 0 && (
                        <th
                            className={actionCellClasses.join(" ")}
                            ref={actionCellRef}
                            rowSpan={stateContext.maxHeadingDepth}
                        ></th>
                    )}
                    {Object.values(Z_TablePinOptions.enum).map((pinOption) => (
                        <Side
                            side={pinOption}
                            sideLevel={index}
                            columns={computedColumnLevels[pinOption][index]}
                            key={`${pinOption}_head_${index}`}
                        />
                    ))}
                </tr>
            ))}
        </TableHeadContext.Provider>
    );
};

export default Head;
