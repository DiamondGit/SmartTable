import SettingsIcon from "@mui/icons-material/Settings";
import { TextField, ToggleButtonGroup } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import { useContext, useEffect, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import Modal, { ModalType } from "..";
import TableConfigContext from "../../../context/TableConfigContext";
import TableStateContext from "../../../context/TableStateContext";
import TableUIContext from "../../../context/TableUIContext";
import { TableCellSizes, TableColumnType, Z_ModalTypes, Z_TableCellSizes } from "../../../types/general";
import Aligner from "../../Aligner";
import DraggableList from "../../DraggableList";
import AddIcon from '@mui/icons-material/Add';

interface SettingsModalType {
    tableTitle?: string;
    open: boolean;
    setOpen: (state: boolean) => void;
}

const SettingsModal = ({ tableTitle = "", open, setOpen }: SettingsModalType) => {
    const tableStateContext = useContext(TableStateContext);
    const UI = useContext(TableUIContext);
    const tableConfigContext = useContext(TableConfigContext);
    const [tableSize, setTableSize] = useState<TableCellSizes>(Z_TableCellSizes.enum.MEDIUM);
    const [isSavingSettings, setSavingSettings] = useState(false);
    const [settingsName, setSettingsName] = useState("");

    const handleChange = (event: React.MouseEvent<HTMLElement>, newTableSize: string | null) => {
        if (newTableSize !== null) {
            setTableSize(newTableSize as TableCellSizes);
            if (tableConfigContext.modalTableConfig) {
                tableConfigContext.setModalTableConfig({
                    ...tableConfigContext.modalTableConfig,
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

    useEffect(() => {
        if (tableConfigContext?.modalTableConfig?.cellSize) {
            setTableSize(tableConfigContext?.modalTableConfig?.cellSize);
        }
    }, [tableConfigContext?.modalTableConfig?.cellSize]);

    const closeModal = () => {
        setOpen(false);
        setSavingSettings(false);
        tableStateContext.setModalTableConfigResetHard(false);
    };

    const applySettings = () => {
        tableConfigContext.setTableConfig(tableConfigContext.modalTableConfig);
    };

    const resetSettings = () => {
        tableConfigContext.setModalTableConfig(tableConfigContext.tableConfig);
    };

    const resetHardSettings = () => {
        tableConfigContext.setModalTableConfig(tableConfigContext.defaultTableConfig, true);
    };

    const onConfirmSettings = () => {
        closeModal();
        applySettings();
    };

    const onCancelSettings = () => {
        closeModal();
        resetSettings();
    };

    const startSaveSettings = () => {
        setSavingSettings(true);
    };

    const confirmSaveSettings = () => {
        setSavingSettings(false);
    };

    const onChangeSettingsName = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length < 16) setSettingsName(event.target.value);
    };

    const modalProps: ModalType = {
        title: (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <SettingsIcon sx={{ fontSize: 24 }} />
                {`Настройка таблицы "${tableTitle}"`.trim()}
            </Aligner>
        ),
        open: open,
        onConfirm: onConfirmSettings,
        onCancel: onCancelSettings,
        type: Z_ModalTypes.enum.SETTINGS,
        isSavingSettings: isSavingSettings,
        leftFooter:
            tableConfigContext.savedTableConfigs.length < 3 ? (
                !isSavingSettings ? (
                    <UI.OutlinedBtn onClick={startSaveSettings}>Сохранить настройку</UI.OutlinedBtn>
                ) : (
                    <Aligner style={{ justifyContent: "space-between", width: "100%" }}>
                        <TextField
                            label="Название"
                            variant="outlined"
                            size={"small"}
                            style={{ width: "150px" }}
                            value={settingsName}
                            onChange={onChangeSettingsName}
                        />
                        <Aligner style={{ justifyContent: "flex-end" }} gutter={8}>
                            <UI.SecondaryBtn onClick={confirmSaveSettings}>Отмена</UI.SecondaryBtn>
                            <UI.PrimaryBtn onClick={confirmSaveSettings}>Сохранить и применить</UI.PrimaryBtn>
                        </Aligner>
                    </Aligner>
                )
            ) : undefined,
    };

    const reorder = (list: TableColumnType[], startIndex: number, endIndex: number): TableColumnType[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = ({ destination, source }: DropResult) => {
        if (!destination) return;

        if (tableConfigContext.modalTableConfig) {
            const newItems = reorder(tableConfigContext.modalTableConfig.table, source.index, destination.index);
            tableConfigContext.setModalTableConfig({
                ...tableConfigContext.modalTableConfig,
                table: newItems,
            });
        }
    };

    const isTableDefaultSettings = JSON.stringify(tableConfigContext.tableConfig) === JSON.stringify(tableConfigContext.defaultTableConfig);
    const isDefaultSettings = JSON.stringify(tableConfigContext.modalTableConfig) === JSON.stringify(tableConfigContext.defaultTableConfig);
    const isTableSettings = JSON.stringify(tableConfigContext.modalTableConfig) === JSON.stringify(tableConfigContext.tableConfig);

    if (tableStateContext.isConfigLoadingError || !tableConfigContext.modalTableConfig) return null;
    return (
        <Modal {...modalProps}>
            <Aligner isVertical style={{ alignItems: "stretch", marginTop: "24px" }}>
                <Aligner style={{ justifyContent: "space-between" }}>
                    <Aligner style={{ alignItems: "flex-start" }} isVertical gutter={4}>
                        Размер ячеек:
                        <ToggleButtonGroup size={"small"} {...tableSizeControl}>
                            {tableSizeOptions.map((tableSizeOption) => (
                                <ToggleButton value={tableSizeOption.key} key={tableSizeOption.key}>
                                    <span style={{ width: "16px" }}>
                                        {tableSizeOption.label}
                                    </span>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Aligner>
                    {
                        ((!isDefaultSettings && !isTableDefaultSettings) || !isTableSettings) &&
                        <Aligner style={{ alignItems: "flex-end" }} isVertical gutter={8}>
                            <Aligner style={{ justifyContent: "flex-start" }} gutter={4}>
                                Сбросить настройки:
                            </Aligner>
                            <Aligner gutter={8}>
                                {!isDefaultSettings && !isTableDefaultSettings && (
                                    <UI.SecondaryBtn onClick={resetHardSettings}>
                                        <Aligner gutter={6}>
                                            <span>По умолчанию</span>
                                        </Aligner>
                                    </UI.SecondaryBtn>
                                )}
                                {!isTableSettings && (
                                    <UI.SecondaryBtn onClick={resetSettings}>
                                        <Aligner gutter={6}>
                                            <span>По текущей таблице</span>
                                        </Aligner>
                                    </UI.SecondaryBtn>
                                )}
                            </Aligner>
                        </Aligner>
                    }
                </Aligner>
                <DraggableList columns={tableConfigContext.modalTableConfig.table} onDragEnd={onDragEnd} />
            </Aligner>
            {/* <UI.SecondaryBtn>
                <Aligner style={{ justifyContent: "flex-start" }} gutter={4}>
                    <AddIcon />
                    Добавить колонку
                </Aligner>
            </UI.SecondaryBtn> */}
        </Modal>
    );
};

export default SettingsModal;
