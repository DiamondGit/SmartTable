import ReplayIcon from "@mui/icons-material/Replay";
import SettingsIcon from "@mui/icons-material/Settings";
import { ToggleButtonGroup } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import { useContext, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import Modal, { ModalType } from "..";
import TableConfigContext from "../../../context/TableConfigContext";
import TableUIContext from "../../../context/TableUIContext";
import { TableCellSizes, TableColumnType, Z_ModalTypes, Z_TableCellSizes } from "../../../types/general";
import Aligner from "../../Aligner";
import DraggableList from "../../DraggableList";

interface SettingsModalType {
    tableName?: string;
    open: boolean;
    setOpen: (state: boolean) => void;
}

const SettingsModal = ({ tableName = "", open, setOpen }: SettingsModalType) => {
    const UI = useContext(TableUIContext);
    const tableConfigContext = useContext(TableConfigContext);
    const [tableSize, setTableSize] = useState<TableCellSizes>(Z_TableCellSizes.enum.MEDIUM);

    const handleChange = (event: React.MouseEvent<HTMLElement>, newTableSize: string) => {
        setTableSize(newTableSize as TableCellSizes);
    };

    const tableSizeControl = {
        value: tableSize,
        onChange: handleChange,
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
                {`Настройка таблицы "${tableName}"`.trim()}
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

        const newItems = reorder(tableConfigContext.tableConfig.table, source.index, destination.index);

        tableConfigContext.setTableConfig({
            ...tableConfigContext.tableConfig,
            table: newItems,
        });
    };

    return (
        <Modal {...modalProps}>
            <Aligner isVertical style={{ alignItems: "stretch", marginTop: "24px" }}>
                <Aligner style={{ justifyContent: "space-between" }}>
                    <Aligner style={{ justifyContent: "flex-start" }} gutter={12}>
                        Размер ячеек:
                        <ToggleButtonGroup size="small" {...tableSizeControl}>
                            {tableSizeOptions.map(tableSizeOption => (
                                <ToggleButton value={tableSizeOption.key} key={tableSizeOption.key}>
                                    {tableSizeOption.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Aligner>
                    <UI.SecondaryBtn>
                        <Aligner gutter={6}>
                            <span>Сброс настроек</span>
                            <ReplayIcon />
                        </Aligner>
                    </UI.SecondaryBtn>
                </Aligner>
                <DraggableList items={tableConfigContext.tableConfig.table} onDragEnd={onDragEnd} />
            </Aligner>
        </Modal>
    );
};

export default SettingsModal;
