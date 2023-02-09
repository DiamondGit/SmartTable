import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton, TextField } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import Modal, { ModalType } from "..";
import ConfigContext from "../../../context/ConfigContext";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import UIContext from "../../../context/UIContext";
import { chooseConfig, createConfig, deleteConfig, setDefaultConfig, updateConfig } from "../../../controllers/controllers";
import { Z_ModalTypes } from "../../../types/enums";
import Aligner from "../../Aligner";
import DraggableList from "../../DraggableList";
import SettingsResetter from "./SettingsResetter";
import TableSizeToggler from "./TableSizeToggler";
import PreviewIcon from "@mui/icons-material/Preview";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "../../Tooltip";
import ConfigSelector from "./ConfigSelector";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
    const [isTransparentModal, setTransparentModal] = useState(false);
    const [isResettedHard, setResettedHard] = useState(false);
    const [isEditingSavedConfig, setEditingSavedConfig] = useState(false);
    const [askDeleteSavedConfig, setAskDeleteSavedConfig] = useState(false);

    const closeModal = () => {
        setOpen(false);
        setSavingSettings(false);
        setResettedHard(false);
        setEditingSavedConfig(false);
        cancelDeleteSavedConfig();
    };

    const applySettings = () => {
        if (configContext.modalTableConfig) {
            configContext.setTableConfig(configContext.modalTableConfig);
            configContext.setSelectedSavedConfigId(configContext.modalSelectedSavedConfigId);

            if (configContext.selectedSavedConfigId !== configContext.modalSelectedSavedConfigId) {
                if (configContext.modalSelectedSavedConfigId) {
                    chooseConfig(propsContext.tableConfigPath, configContext.modalSelectedSavedConfigId);
                } else {
                    setDefaultConfig(propsContext.tableConfigPath);
                }
            }
        }
    };

    const resetSettings = () => {
        const currentSavedConfig = configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId);
        if (currentSavedConfig) {
            configContext.setModalTableConfig(currentSavedConfig.configParams);
        }
    };

    const resetHardSettings = () => {
        if (configContext.defaultTableConfig) {
            setResettedHard(true);
            configContext.setModalTableConfig(configContext.defaultTableConfig);
            configContext.setModalSelectedSavedConfigId(undefined);
        }
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
        if (isEditingSavedConfig && configContext.modalSelectedSavedConfigId && configContext.modalTableConfig) {
            updateConfig({
                id: configContext.modalSelectedSavedConfigId,
                configName: settingsName,
                configParams: configContext.modalTableConfig,
                tableName: propsContext.tableConfigPath,
            });
            configContext.requestSavedConfigs();
        } else if (configContext.modalTableConfig) {
            createConfig({
                configName: settingsName,
                configParams: configContext.modalTableConfig,
                tableName: propsContext.tableConfigPath,
            }).then(() => {
                handleCancelSaveSettings();
                handleConfirmSettings();
                configContext.requestSavedConfigs();
            });
        }
    };

    const handleCancelSaveSettings = () => {
        if (isEditingSavedConfig) {
            setEditingSavedConfig(false);
        } else {
            setSavingSettings(false);
        }
    };

    const handleMouseDownTransparent = () => {
        setTransparentModal(true);
    };

    const handleMouseUpTransparent = () => {
        setTransparentModal(false);
    };

    const clickDeleteSavedConfig = () => {
        setAskDeleteSavedConfig(true);
    };

    const handleDeleteSavedConfig = () => {
        if (configContext.modalSelectedSavedConfigId && configContext.defaultTableConfig) {
            deleteConfig(configContext.modalSelectedSavedConfigId);
            configContext.requestSavedConfigs();
            configContext.setModalTableConfig(configContext.defaultTableConfig);
            configContext.setSelectedSavedConfigId(undefined);
            configContext.setModalSelectedSavedConfigId(undefined);
            cancelDeleteSavedConfig();
        }
    };

    const cancelDeleteSavedConfig = () => {
        setAskDeleteSavedConfig(false);
    };

    useEffect(() => {
        setSettingsName("");
    }, [isSavingSettings]);

    useEffect(() => {
        setSavingSettings(false);
        cancelDeleteSavedConfig();
        if (configContext.modalSelectedSavedConfigId) {
            setSettingsName(configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId)?.configName || "");
        }
    }, [configContext.modalSelectedSavedConfigId]);

    useEffect(() => {
        setResettedHard(false);
    }, [configContext.modalTableConfig]);

    const handleChangeSettingsName = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length < 16) setSettingsName(event.target.value);
    };

    const handleEditSavedSettings = () => {
        setEditingSavedConfig(true);
    };

    const isUsingDefaultSettings = configContext.modalSelectedSavedConfigId === undefined;

    const ConfigDeleteButton = () =>
        askDeleteSavedConfig ? (
            <>
                <IconButton size={"small"} onClick={cancelDeleteSavedConfig} style={{ color: "red" }}>
                    <CancelIcon />
                </IconButton>
                <IconButton size={"small"} onClick={handleDeleteSavedConfig} style={{ color: "green" }}>
                    <CheckCircleIcon />
                </IconButton>
            </>
        ) : (
            <IconButton size={"small"} onClick={clickDeleteSavedConfig}>
                <DeleteIcon />
            </IconButton>
        );

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <SettingsIcon sx={{ fontSize: 24 }} />
                {`Настройка таблицы "${propsContext.tableTitle}"`.trim()}
                <Tooltip title={"Скрыть модальное окно"}>
                    <IconButton
                        size={"small"}
                        onMouseDownCapture={handleMouseDownTransparent}
                        onMouseUpCapture={handleMouseUpTransparent}
                        onMouseLeave={handleMouseUpTransparent}
                    >
                        <PreviewIcon />
                    </IconButton>
                </Tooltip>
            </Aligner>
        ),
        open: open,
        onConfirm: handleConfirmSettings,
        onCancel: handleCancelSettings,
        type: Z_ModalTypes.enum.SETTINGS,
        hideRightFooter: isSavingSettings || isEditingSavedConfig,
        isTransparentModal: isTransparentModal,
        leftFooter: isUsingDefaultSettings ? (
            configContext.savedTableConfigs.length < 5 ? (
                isSavingSettings ? (
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
                            <UI.SecondaryBtn onClick={handleCancelSaveSettings}>Отмена</UI.SecondaryBtn>
                            <UI.PrimaryBtn onClick={confirmSaveSettings}>Сохранить и применить</UI.PrimaryBtn>
                        </Aligner>
                    </Aligner>
                ) : (
                    <UI.OutlinedBtn onClick={startSaveSettings}>Сохранить настройку</UI.OutlinedBtn>
                )
            ) : undefined
        ) : isEditingSavedConfig ? (
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
                    <UI.SecondaryBtn onClick={handleCancelSaveSettings}>Отмена</UI.SecondaryBtn>
                    <UI.PrimaryBtn onClick={confirmSaveSettings}>Сохранить и применить</UI.PrimaryBtn>
                </Aligner>
            </Aligner>
        ) : (
            <>
                <UI.OutlinedBtn onClick={handleEditSavedSettings}>Изменить</UI.OutlinedBtn>
                <ConfigDeleteButton />
            </>
        ),
        rightFooter: (
            <>
                <UI.SecondaryBtn onClick={handleCancelSettings}>Отмена</UI.SecondaryBtn>
                <UI.PrimaryBtn onClick={handleConfirmSettings}>Применить</UI.PrimaryBtn>
            </>
        ),
    };

    if (stateContext.isDefaultConfigLoadingError || !configContext.modalTableConfig) return null;
    return (
        <Modal {...modalProps}>
            <Aligner isVertical style={{ alignItems: "stretch", marginTop: "24px" }}>
                <Aligner style={{ justifyContent: "space-between" }}>
                    <TableSizeToggler />
                    <SettingsResetter
                        isResettedHard={isResettedHard}
                        resetSettings={resetSettings}
                        resetHardSettings={resetHardSettings}
                    />
                </Aligner>
                <DraggableList />
                <ConfigSelector isEditingSavedConfig={isEditingSavedConfig} />
            </Aligner>
        </Modal>
    );
};

export default SettingsModal;
