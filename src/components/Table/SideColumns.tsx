import ConfigContext from "../../context/ConfigContext";
import { TableColumnType, TablePinOptions, Z_TablePinOptions } from "../../types/general";
import { useContext, useEffect, useState } from "react";
import HeadCell from "./Head/Cell";
import BodyCell from "./Body/Cell";

const SideColumns = ({
    pinOption = Z_TablePinOptions.enum.NONE,
    isHead = false,
}: {
    pinOption?: TablePinOptions;
    isHead?: boolean;
}) => {
    const { tableConfig } = useContext(ConfigContext);

    const [computedColumns, setComputedColumns] = useState<TableColumnType[]>([]);

    useEffect(() => {
        if (!tableConfig?.table) return;
        setComputedColumns(() =>
            tableConfig.table.filter((column) => (!column.hidable || column.visible) && column.pin === pinOption)
        );
    }, [tableConfig]);

    if (!tableConfig) return null;
    return (
        <>
            {computedColumns.map((column, index) => {
                const props = {
                    column,
                    order: pinOption === Z_TablePinOptions.enum.RIGHT ? computedColumns.length - 1 - index : index,
                    key: column.dataIndex + index + `_${isHead ? "head" : "body"}`,
                };
                return isHead ? <HeadCell {...props} /> : <BodyCell {...props} />;
            })}
        </>
    );
};

export default SideColumns;
