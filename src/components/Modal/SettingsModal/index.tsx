import DeleteIcon from "@mui/icons-material/Delete";
import PreviewIcon from "@mui/icons-material/Preview";
import SettingsIcon from "@mui/icons-material/Settings";
import { Alert, IconButton, TextField } from "@mui/material";
import { Button, message, Popconfirm } from "antd";
import { useContext, useEffect, useState } from "react";
import Modal, { ModalType } from "..";
import { MESSAGE } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import PropsContext from "../../../context/PropsContext";
import SettingsContext from "../../../context/SettingsContext";
import StateContext from "../../../context/StateContext";
import { chooseConfig, createConfig, deleteConfig, setDefaultConfig, updateConfig } from "../../../controllers/controllers";
import { Z_ModalTypes } from "../../../types/enums";
import { GeneralObject } from "../../../types/general";
import Aligner from "../../Aligner";
import DraggableList from "../../DraggableList";
import Tooltip from "../../Tooltip";
import ConfigSelector from "./ConfigSelector";
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

    const [settingsName, setSettingsName] = useState("");

    const [isResettedHard, setResettedHard] = useState(false);
    const [isSavingSettings, setSavingSettings] = useState(false);
    const [isTransparentModal, setTransparentModal] = useState(false);
    const [isEditingSavedConfig, setEditingSavedConfig] = useState(false);

    const [configError, setConfigError] = useState<GeneralObject>({});
    const hasError = Object.values(configError).some((error) => !!error);

    const [modalLoading, setModalLoading] = useState(false);
    const [isConfigEditable, setConfigEditable] = useState(false);

    const closeModal = () => {
        setOpen(false);
        setSavingSettings(false);
        setResettedHard(false);
        setEditingSavedConfig(false);
        setConfigError({});
    };

    const currentSavedConfig = configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId);
    const currentSavedConfigName = currentSavedConfig?.configName || "";

    const isDefaultSettings =
        JSON.stringify(configContext.modalTableConfig) === JSON.stringify(configContext.defaultTableConfig) &&
        configContext.modalSelectedSavedConfigId === undefined;

    const isSavedSettingsChanged = currentSavedConfig
        ? JSON.stringify(currentSavedConfig?.configParams) !== JSON.stringify(configContext.modalTableConfig)
        : false;

    const resetSettings = () => {
        if (currentSavedConfig) {
            configContext.setModalTableConfig(currentSavedConfig.configParams);
        }
    };

    useEffect(() => {
        setConfigEditable(!configContext.modalSelectedSavedConfigId);
    }, [open, configContext.modalSelectedSavedConfigId]);

    const resetHardSettings = () => {
        if (configContext.defaultTableConfig) {
            setResettedHard(true);
            setConfigEditable(true);
            setEditingSavedConfig(false);
            configContext.setModalTableConfig(configContext.defaultTableConfig);
            configContext.setModalSelectedSavedConfigId(undefined);
        }
    };

    const handleApplyConfig = () => {
        const applyConfig = (isDefault = false, isError = false) => {
            if (configContext.modalTableConfig) {
                configContext.setTableConfig(configContext.modalTableConfig);
                configContext.setSelectedSavedConfigId(configContext.modalSelectedSavedConfigId);
                if (isError) {
                    message.warning(MESSAGE.error.config.apply);
                } else {
                    if (isDefault) {
                        message.success(MESSAGE.success.config.default);
                    } else {
                        message.success(MESSAGE.success.config.apply(currentSavedConfigName));
                    }
                }
                closeModal();
            }
        };
        if (configContext.modalSelectedSavedConfigId) {
            if (configContext.modalSelectedSavedConfigId !== configContext.selectedSavedConfigId) {
                setModalLoading(true);
                chooseConfig(propsContext.configPath, configContext.modalSelectedSavedConfigId)
                    .then(() => {
                        applyConfig();
                    })
                    .catch(() => {
                        applyConfig(false, true);
                    })
                    .finally(() => {
                        setModalLoading(false);
                    });
            } else {
                closeModal();
            }
        } else {
            if (isDefaultSettings && configContext.selectedSavedConfigId !== configContext.modalSelectedSavedConfigId) {
                setModalLoading(true);
                setDefaultConfig(propsContext.configPath)
                    .then(() => {
                        applyConfig(true);
                    })
                    .catch(() => {
                        applyConfig(true, true);
                    })
                    .finally(() => {
                        setModalLoading(false);
                    });
            } else if (configContext.modalTableConfig) {
                configContext.setTableConfig(configContext.modalTableConfig);
                closeModal();
            }
        }
    };

    const confirmSaveSettings = () => {
        if (isEditingSavedConfig && configContext.modalSelectedSavedConfigId && configContext.modalTableConfig) {
            if (isSavedSettingsChanged || settingsName !== currentSavedConfigName) {
                setModalLoading(true);
                updateConfig({
                    id: configContext.modalSelectedSavedConfigId,
                    configName: settingsName,
                    configParams: configContext.modalTableConfig,
                    tableName: propsContext.configPath,
                })
                    .then(() => {
                        if (configContext.modalSelectedSavedConfigId) {
                            chooseConfig(propsContext.configPath, configContext.modalSelectedSavedConfigId)
                                .then(() => {
                                    if (configContext.modalTableConfig) {
                                        configContext.setTableConfig(configContext.modalTableConfig);
                                        configContext.setSelectedSavedConfigId(configContext.modalSelectedSavedConfigId);
                                        message.success(MESSAGE.success.config.updateApply(currentSavedConfigName));
                                        closeModal();
                                    }
                                })
                                .catch(() => {
                                    message.error(MESSAGE.error.general);
                                })
                                .finally(() => {
                                    setModalLoading(false);
                                });
                        }
                        configContext.requestSavedConfigs();
                    })
                    .catch((error) => {
                        message.error(MESSAGE.error.update);
                        setConfigError(error?.response?.data?.errors || {});
                        setModalLoading(false);
                    });
            } else {
                if (configContext.selectedSavedTableConfigId !== configContext.modalSelectedSavedConfigId) {
                    handleApplyConfig();
                } else {
                    configContext.setTableConfig(configContext.modalTableConfig);
                    closeModal();
                }
            }
        } else if (isSavingSettings && configContext.modalTableConfig) {
            setModalLoading(true);
            createConfig({
                configName: settingsName,
                configParams: configContext.modalTableConfig,
                tableName: propsContext.configPath,
            })
                .then(() => {
                    setSavingSettings(false);
                    configContext.requestSavedConfigs();
                    message.success(MESSAGE.success.config.create(settingsName));
                })
                .catch((error) => {
                    message.error(MESSAGE.error.create);
                    setConfigError(error?.response?.data?.errors || {});
                })
                .finally(() => {
                    setModalLoading(false);
                });
        }
    };

    const handleCancelSettings = () => {
        closeModal();
        resetSettings();
    };

    const handleCancelSaveSettings = () => {
        if (isEditingSavedConfig) {
            const selectedConfig = configContext.savedTableConfigs.find(
                (savedConfig) => savedConfig.id === configContext.modalSelectedSavedConfigId
            )?.configParams;
            if (selectedConfig) {
                setEditingSavedConfig(false);
                setConfigEditable(false);
                configContext.setModalTableConfig(selectedConfig);
            }
        } else if (isSavingSettings) {
            setSavingSettings(false);
        }
    };

    const startSaveSettings = () => {
        setSettingsName("");
        setSavingSettings(true);
    };

    const handleMouseDownTransparent = () => {
        setTransparentModal(true);
    };

    const handleMouseUpTransparent = () => {
        setTransparentModal(false);
    };

    const handleDeleteSavedConfig = () => {
        if (configContext.modalSelectedSavedConfigId && configContext.defaultTableConfig) {
            const configName = configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId)?.configName || " ";
            setModalLoading(true);
            deleteConfig(configContext.modalSelectedSavedConfigId)
                .then(() => {
                    message.success(MESSAGE.success.config.delete(configName));
                    configContext.requestSavedConfigs();
                    configContext.setSelectedSavedConfigId(undefined);
                    configContext.setModalSelectedSavedConfigId(undefined);
                    if (configContext.defaultTableConfig) {
                        configContext.setModalTableConfig(configContext.defaultTableConfig);
                    }
                })
                .catch(() => {
                    message.error(MESSAGE.error.delete);
                })
                .finally(() => {
                    setModalLoading(false);
                });
        }
    };

    useEffect(() => {
        setSavingSettings(false);
        if (configContext.modalSelectedSavedConfigId) {
            setSettingsName(configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId)?.configName || "");
        }
    }, [configContext.modalSelectedSavedConfigId]);

    useEffect(() => {
        setResettedHard(false);
    }, [configContext.modalTableConfig]);

    const handleChangeSettingsName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfigError({});
        if (event.target.value.length < 16) setSettingsName(event.target.value);
    };

    const handleEditSavedSettings = () => {
        setSettingsName(currentSavedConfigName);
        setConfigEditable(true);
        setEditingSavedConfig(true);
    };

    const repeatSavedConfigRequest = () => {
        configContext.requestSavedConfigs();
    };

    const isUsingDefaultSettings = configContext.modalSelectedSavedConfigId === undefined;

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <SettingsIcon sx={{ fontSize: 24 }} />
                {`Настройка таблицы "${propsContext.tableTitle}"`.trim()}
                <Tooltip title="Скрыть модальное окно">
                    <IconButton
                        size="small"
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
        onConfirm: () => {},
        onCancel: handleCancelSettings,
        type: Z_ModalTypes.enum.SETTINGS,
        isTransparentModal: isTransparentModal,
        closable: !modalLoading,
        leftFooter: isUsingDefaultSettings ? (
            configContext.savedTableConfigs.length < 5 ? (
                isSavingSettings ? (
                    <TextField
                        error={hasError}
                        helperText={configError.configName}
                        label="Название"
                        variant="outlined"
                        size="small"
                        style={{ width: "150px" }}
                        value={settingsName}
                        onChange={handleChangeSettingsName}
                        disabled={modalLoading}
                    />
                ) : (
                    <Button onClick={startSaveSettings} disabled={modalLoading}>
                        Сохранить настройку
                    </Button>
                )
            ) : undefined
        ) : isEditingSavedConfig ? (
            <TextField
                error={hasError}
                helperText={configError.configName}
                label="Название"
                variant="outlined"
                size="small"
                style={{ width: "150px" }}
                value={settingsName}
                onChange={handleChangeSettingsName}
                disabled={modalLoading}
            />
        ) : (
            <>
                <Button onClick={handleEditSavedSettings} disabled={modalLoading}>
                    Изменить
                </Button>
                <Popconfirm
                    title={`Удалить настройку "${currentSavedConfig?.configName}"?`}
                    okText="Да"
                    okButtonProps={{
                        danger: true,
                        size: "small",
                        style: { width: "50px" },
                    }}
                    onConfirm={handleDeleteSavedConfig}
                    cancelText="Нет"
                    cancelButtonProps={{
                        size: "small",
                        style: { width: "50px" },
                    }}
                >
                    <IconButton size="small" disabled={modalLoading}>
                        <DeleteIcon />
                    </IconButton>
                </Popconfirm>
            </>
        ),
        rightFooter:
            isEditingSavedConfig || isSavingSettings ? (
                <>
                    <Button onClick={handleCancelSaveSettings} disabled={modalLoading}>
                        Отмена
                    </Button>
                    <Button type="primary" onClick={confirmSaveSettings} disabled={modalLoading}>
                        Сохранить и применить
                    </Button>
                </>
            ) : (
                <>
                    <Button onClick={handleCancelSettings} disabled={modalLoading}>
                        Отмена
                    </Button>
                    <Button type="primary" onClick={handleApplyConfig} disabled={modalLoading}>
                        Применить
                    </Button>
                </>
            ),
    };

    if (stateContext.isDefaultConfigLoadingError || !configContext.modalTableConfig) return null;
    return (
        <SettingsContext.Provider value={{ isLoading: modalLoading, isConfigEditable, setConfigEditable }}>
            <Modal {...modalProps}>
                <Aligner isVertical style={{ alignItems: "stretch" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px", alignItems: "start" }}>
                        <TableSizeToggler />
                        <SettingsResetter
                            isDefaultSettings={isDefaultSettings}
                            isResettedHard={isResettedHard}
                            resetSettings={resetSettings}
                            resetHardSettings={resetHardSettings}
                        />
                    </div>
                    <DraggableList />
                    {stateContext.isSavedConfigsLoadingError ? (
                        <Alert
                            severity="error"
                            action={
                                <Button
                                    danger
                                    onClick={repeatSavedConfigRequest}
                                    loading={stateContext.isSavedConfigsLoading}
                                >
                                    Повторить попытку
                                </Button>
                            }
                        >
                            При загрузке сохраненных настроек произошла ошибка!
                        </Alert>
                    ) : (
                        <ConfigSelector isEditingSavedConfig={isEditingSavedConfig || isSavingSettings} />
                    )}
                </Aligner>
            </Modal>
        </SettingsContext.Provider>
    );
};

export default SettingsModal;
