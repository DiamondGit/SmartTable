import ConfigContext from "../../../context/ConfigContext";
import { TablePinOptions, Z_TablePinOptions } from "../../../types/enums";
import { useContext, useState, useEffect } from "react";
import { ColumnType } from "../../../types/general";
import { FLAG } from "../../../constants/general";
import Cell from "./Cell";

const Side = ({ side = Z_TablePinOptions.enum.NONE }: { side?: TablePinOptions }) => {
    const { tableConfig } = useContext(ConfigContext);

    const [columns, setColumns] = useState<ColumnType[]>([]);

    const getColumns = (column: ColumnType): ColumnType | ColumnType[] => {
        if (!column.subcolumns) return column;

        let subcolumns: ColumnType[] = [];
        column.subcolumns.forEach((subcolumn) => {
            subcolumns = subcolumns.concat(getColumns(subcolumn));
        });

        return subcolumns;
    };

    useEffect(() => {
        if (!tableConfig?.table) return;

        const computedColumns = tableConfig.table.filter(
            (column) => (!column.hidable || column.visible) && column.pin === side
        );

        let tempColumns: ColumnType[] = [];
        computedColumns.forEach((column) => {
            tempColumns = tempColumns.concat(getColumns(column));
        });

        setColumns(tempColumns);
    }, [tableConfig]);

    if (!tableConfig) return null;
    return (
        <>
            {columns.map((column, index) => {
                const mainOrder = side === Z_TablePinOptions.enum.RIGHT ? columns.length - 1 - index : index;
                return (
                    <Cell
                        {...{
                            column,
                            order: mainOrder,
                            key: `${column[FLAG.path]}_body_cell`,
                        }}
                    />
                );
            })}
        </>
    );
};

export default Side;
