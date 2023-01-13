import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import { TablePinOptions, Z_TablePinOptions } from "../../../types/general";
import Cell from "./Cell";

const SideColumns = ({ pinOption = Z_TablePinOptions.enum.NONE }: { pinOption?: TablePinOptions }) => {
    const { tableConfig } = useContext(ConfigContext);

    if (!tableConfig) return null;
    return (
        <>
            {tableConfig.table
                .filter((column) => (!column.hidable || column.visible) && column.pin === pinOption)
                .map((column, index) => (
                    <Cell column={column} order={index} key={index} />
                ))}
        </>
    );
};

export default SideColumns;