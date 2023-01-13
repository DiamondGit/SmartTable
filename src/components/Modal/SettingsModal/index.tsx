import SettingsIcon from "@mui/icons-material/Settings";
import { TextField } from "@mui/material";
import { useContext, useState } from "react";
import Modal, { ModalType } from "..";
import ConfigContext from "../../../context/ConfigContext";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import UIContext from "../../../context/UIContext";
import { Z_ModalTypes } from "../../../types/general";
import Aligner from "../../Aligner";
import DraggableList from "../../DraggableList";
import SettingsResetter from "./SettingsResetter";
import TableSizeToggler from "./TableSizeToggler";

interface SettingsModalType {
    open: boolean;
    setOpen: (state: boolean) => void;
}

const SettingsModal = ({ open, setOpen }: SettingsModalType) => {
    const stateContext = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const propsContext = useContext(PropsContext);
    const UI = useContext(UIContext);
    const [isSavingSettings, setSavingSettings] = useState(false);
    const [settingsName, setSettingsName] = useState("");

    const closeModal = () => {
        setOpen(false);
        setSavingSettings(false);
    };

    const applySettings = () => {
        configContext.setTableConfig(configContext.modalTableConfig);
    };

    const resetSettings = () => {
        configContext.setModalTableConfig(configContext.tableConfig);
    };

    const resetHardSettings = () => {
        configContext.setModalTableConfig(configContext.defaultTableConfig, true);
    };

    const handleConfirmSettings = () => {
        closeModal();
        applySettings();
    };

    const handleCancelSettings = () => {
        closeModal();
        resetSettings();
    };

    const startSaveSettings = () => {
        setSavingSettings(true);
    };

    const confirmSaveSettings = () => {
        setSavingSettings(false);
    };

    const handleChangeSettingsName = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length < 16) setSettingsName(event.target.value);
    };

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <SettingsIcon sx={{ fontSize: 24 }} />
                {`Настройка таблицы "${propsContext.tableTitle}"`.trim()}
            </Aligner>
        ),
        open: open,
        onConfirm: handleConfirmSettings,
        onCancel: handleCancelSettings,
        type: Z_ModalTypes.enum.SETTINGS,
        isSavingSettings: isSavingSettings,
        leftFooter:
            configContext.savedTableConfigs.length < 3 ? (
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
                            onChange={handleChangeSettingsName}
                        />
                        <Aligner style={{ justifyContent: "flex-end" }} gutter={8}>
                            <UI.SecondaryBtn onClick={confirmSaveSettings}>Отмена</UI.SecondaryBtn>
                            <UI.PrimaryBtn onClick={confirmSaveSettings}>Сохранить и применить</UI.PrimaryBtn>
                        </Aligner>
                    </Aligner>
                )
            ) : undefined,
        rightFooter: (
            <>
                <UI.SecondaryBtn onClick={handleCancelSettings}>Отмена</UI.SecondaryBtn>
                <UI.PrimaryBtn onClick={handleConfirmSettings}>Применить</UI.PrimaryBtn>
            </>
        ),
    };

    if (stateContext.isConfigLoadingError || !configContext.modalTableConfig) return null;
    return (
        <Modal {...modalProps}>
            <Aligner isVertical style={{ alignItems: "stretch", marginTop: "24px" }}>
                <Aligner style={{ justifyContent: "space-between" }}>
                    <TableSizeToggler />
                    <SettingsResetter resetSettings={resetSettings} resetHardSettings={resetHardSettings} />
                </Aligner>
                <DraggableList />
            </Aligner>
        </Modal>
    );
};

export default SettingsModal;
