import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import { TablePinOptions, Z_TablePinOptions } from "../../../types/enums";
import { ColumnType } from "../../../types/general";
import Cell from "./Cell";

const Side = ({ columns, sideLevel, side = Z_TablePinOptions.enum.NONE }: { columns: ColumnType[]; sideLevel: number, side?: TablePinOptions }) => {
    const { tableConfig } = useContext(ConfigContext);

    if (!tableConfig || !columns) return null;
    return (
        <>
            {columns.map((column, index) => {
                const mainOrder = side === Z_TablePinOptions.enum.RIGHT ? columns.length - 1 - index : index;
                return (
                    <Cell
                        {...{
                            column,
                            order: mainOrder,
                            key: `${index}_${side}_${sideLevel}_head_cell`,
                        }}
                    />
                );
            })}
        </>
    );
};

export default Side;
