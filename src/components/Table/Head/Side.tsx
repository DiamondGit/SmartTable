import { useContext } from "react";
import { FLAG } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import { TablePinOptions, Z_TablePinOptions } from "../../../types/enums";
import { ColumnType } from "../../../types/general";
import Cell from "./Cell";

const Side = ({ columns, side = Z_TablePinOptions.enum.NONE }: { columns: ColumnType[]; side: TablePinOptions }) => {
    const { tableConfig } = useContext(ConfigContext);

    if (!tableConfig) return null;
    return (
        <>
            {columns.map((column, index) => (
                <Cell
                    {...{
                        column,
                        order: side === Z_TablePinOptions.enum.RIGHT ? columns.length - 1 - index : index,
                        key: `${column[FLAG.namedDataIndex]}_${index}_head_cell`,
                    }}
                />
            ))}
        </>
    );
};

export default Side;
