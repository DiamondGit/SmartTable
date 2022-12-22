import ReplayIcon from "@mui/icons-material/Replay";
import SettingsIcon from "@mui/icons-material/Settings";
import { ToggleButtonGroup } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import { useContext, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import Modal, { ModalType } from "..";
import _tableConfig_ from "../../../config/table.json";
import TableConfigContext from "../../../context/TableConfigContext";
import TableStateContext from "../../../context/TableStateContext";
import TableUIContext from "../../../context/TableUIContext";
import { TableCellSizes, TableColumnType, TableConfigSchema, Z_ModalTypes, Z_TableCellSizes } from "../../../types/general";
import Aligner from "../../Aligner";
import DraggableList from "../../DraggableList";

interface SettingsModalType {
    tableTitle?: string;
    open: boolean;
    setOpen: (state: boolean) => void;
}

const SettingsModal = ({ tableTitle = "", open, setOpen }: SettingsModalType) => {
    const tableStateContext = useContext(TableStateContext);
    const UI = useContext(TableUIContext);
    const tableConfigContext = useContext(TableConfigContext);
    const [tableSize, setTableSize] = useState<TableCellSizes>(tableConfigContext?.tableConfig?.cellSize || Z_TableCellSizes.enum.MEDIUM);

    const handleChange = (event: React.MouseEvent<HTMLElement>, newTableSize: string | null) => {
        if (newTableSize !== null) {
            setTableSize(newTableSize as TableCellSizes);
            if (tableConfigContext.tableConfig) {
                tableConfigContext.setTableConfig({
                    ...tableConfigContext.tableConfig,
                    cellSize: newTableSize as TableCellSizes,
                });
            }
            tableStateContext.isSettingsChanged = true;
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

    const onCancel = () => {
        setOpen(false);
    };

    const modalProps: ModalType = {
        title: (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <SettingsIcon sx={{ fontSize: 24 }} />
                {`Настройка таблицы "${tableTitle}"`.trim()}
            </Aligner>
        ),
        open: open,
        onCancel: onCancel,
        type: Z_ModalTypes.enum.SETTINGS,
    };

    const reorder = (list: TableColumnType[], startIndex: number, endIndex: number): TableColumnType[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = ({ destination, source }: DropResult) => {
        if (!destination) return;

        if (tableConfigContext.tableConfig) {
            const newItems = reorder(tableConfigContext.tableConfig.table, source.index, destination.index);
    
            tableConfigContext.setTableConfig({
                ...tableConfigContext.tableConfig,
                table: newItems,
            });
        }
    };

    const resetSettings = () => {
        tableConfigContext.setTableConfig(TableConfigSchema.parse(_tableConfig_));
        setTableSize(Z_TableCellSizes.enum.MEDIUM);
    };

    if (tableStateContext.isConfigLoadingError || !tableConfigContext.tableConfig) return null;
    return (
        <Modal {...modalProps}>
            <Aligner isVertical style={{ alignItems: "stretch", marginTop: "24px" }}>
                <Aligner style={{ justifyContent: "space-between" }}>
                    <Aligner style={{ justifyContent: "flex-start" }} gutter={12}>
                        Размер ячеек:
                        <ToggleButtonGroup size={"small"} {...tableSizeControl}>
                            {tableSizeOptions.map((tableSizeOption) => (
                                <ToggleButton value={tableSizeOption.key} key={tableSizeOption.key}>
                                    {tableSizeOption.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Aligner>
                    {tableStateContext.isSettingsChanged && (
                        <UI.SecondaryBtn onClick={resetSettings}>
                            <Aligner gutter={6}>
                                <span>Сброс настроек</span>
                                <ReplayIcon />
                            </Aligner>
                        </UI.SecondaryBtn>
                    )}
                </Aligner>
                <DraggableList columns={tableConfigContext.tableConfig.table} onDragEnd={onDragEnd} />
            </Aligner>
        </Modal>
    );
};

export default SettingsModal;
