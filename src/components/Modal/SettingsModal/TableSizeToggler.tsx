import { ToggleButton, ToggleButtonGroup } from "@mui/lab";
import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import { TableCellSizes, Z_TableCellSizes } from "../../../types/enums";
import Aligner from "../../Aligner";

const TableSizeToggler = () => {
    const configContext = useContext(ConfigContext);
    const [tableSize, setTableSize] = useState<TableCellSizes>(Z_TableCellSizes.enum.MEDIUM);

    useEffect(() => {
        if (configContext?.modalTableConfig?.cellSize) {
            setTableSize(configContext?.modalTableConfig?.cellSize);
        }
    }, [configContext?.modalTableConfig?.cellSize]);

    const handleChange = (event: React.MouseEvent<HTMLElement>, newTableSize: string | null) => {
        if (newTableSize !== null) {
            setTableSize(newTableSize as TableCellSizes);
            if (configContext.modalTableConfig) {
                configContext.setModalTableConfig({
                    ...configContext.modalTableConfig,
                    cellSize: newTableSize as TableCellSizes,
                });
            }
        }
    };

    const tableSizeControl = {
        value: tableSize,
        onChange: handleChange,
        exclusive: true,
    };

    const tableSizeOptions = [
        {
            key: Z_TableCellSizes.enum.SMALL,
            label: "S",
        },
        {
            key: Z_TableCellSizes.enum.MEDIUM,
            label: "M",
        },
        {
            key: Z_TableCellSizes.enum.LARGE,
            label: "L",
        },
    ];

    return (
        <Aligner style={{ alignItems: "flex-start" }} isVertical gutter={4}>
            Размер ячеек:
            <ToggleButtonGroup size={"small"} {...tableSizeControl}>
                {tableSizeOptions.map((tableSizeOption) => (
                    <ToggleButton value={tableSizeOption.key} key={tableSizeOption.key}>
                        <span style={{ width: "16px" }}>{tableSizeOption.label}</span>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Aligner>
    );
};

export default TableSizeToggler;
