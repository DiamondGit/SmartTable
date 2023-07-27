import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { Typography } from "@mui/material";
import { Button, Input, Popconfirm, Select } from "antd";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import SettingsContext from "../../../context/SettingsContext";
import Aligner from "../../Aligner";
import { CONFIG_DEFAULT_VALUE } from "../../../constants/general";

const ConfigSelector = () => {
    const configContext = useContext(ConfigContext);
    const {
        isLoading,
        setConfigEditable,
        isUsingDefaultSettings,
        canAdd,
        isSavingSettings,
        isEditingSavedConfig,
        startSaveSettings,
        handleEditSavedSettings,
        handleDeleteSavedConfig,
        handleChangeSettingsName,
        handleCancelSaveSettings,
        currentSavedConfigName,
        settingsName,
    } = useContext(SettingsContext);

    const handleSetDefaultConfig = () => {
        if (configContext.defaultTableConfig) {
            configContext.setModalSelectedSavedConfigId(undefined);
            configContext.setModalTableConfig(configContext.defaultTableConfig);
        }
    };

    const handleChange = (event: any) => {
        if (event === CONFIG_DEFAULT_VALUE) {
            handleSetDefaultConfig();
        } else {
            const selectedId = parseInt(event);
            const selectedConfig = configContext.savedTableConfigs.find(
                (savedConfig) => savedConfig.id === selectedId
            )?.configParams;

            if (selectedConfig) {
                setConfigEditable(false);
                configContext.setModalTableConfig(selectedConfig);
                configContext.setModalSelectedSavedConfigId(selectedId);
            } else {
                setConfigEditable(true);
                handleSetDefaultConfig();
            }
        }
    };

    if (configContext.savedTableConfigs.length === 0) return null;
    return (
        <Aligner style={{ justifyContent: "flex-start", flexWrap: "wrap" }} isVertical gutter={4}>
            <Typography width={"100%"}>Сохраненных настроек: {configContext.savedTableConfigs.length} (макс. 5)</Typography>
            <div
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: isSavingSettings ? "auto 1fr 1fr" : "auto 1fr auto auto 1fr",
                    gap: "8px",
                    alignItems: "center",
                }}
            >
                <Button
                    type="ghost"
                    shape="circle"
                    icon={isSavingSettings ? <ClearIcon /> : <AddCircleOutlineIcon />}
                    style={{
                        color: "#7ABB6D",
                        opacity: !canAdd || (isEditingSavedConfig && !isSavingSettings) || isLoading ? 0.5 : 1,
                    }}
                    onClick={isSavingSettings ? handleCancelSaveSettings : startSaveSettings}
                    disabled={!canAdd || (isEditingSavedConfig && !isSavingSettings) || isLoading}
                />
                <Select
                    value={configContext.modalSelectedSavedConfigId || CONFIG_DEFAULT_VALUE}
                    onChange={handleChange}
                    disabled={isSavingSettings || isEditingSavedConfig || isLoading}
                >
                    <Select.Option value={CONFIG_DEFAULT_VALUE}>
                        <em>По умолчанию</em>
                    </Select.Option>
                    {configContext.savedTableConfigs.map((savedTableConfig) => (
                        <Select.Option value={savedTableConfig.id} key={savedTableConfig.configName}>
                            {savedTableConfig.configName}
                        </Select.Option>
                    ))}
                </Select>
                {configContext.modalSelectedSavedConfigId && !isSavingSettings && (
                    <>
                        <Button
                            type="ghost"
                            shape="circle"
                            icon={isEditingSavedConfig ? <ClearIcon /> : <EditIcon />}
                            style={{ color: "#F5A225", opacity: isLoading || isSavingSettings ? 0.5 : 1 }}
                            onClick={isEditingSavedConfig ? handleCancelSaveSettings : handleEditSavedSettings}
                            disabled={isLoading || isSavingSettings}
                        />
                        <Popconfirm
                            title={`Удалить настройку "${currentSavedConfigName}"?`}
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
                            <Button
                                type="ghost"
                                shape="circle"
                                icon={<DeleteOutlineIcon />}
                                style={{ color: "#FA6855", opacity: isLoading ? 0.5 : 1 }}
                                disabled={isLoading}
                            />
                        </Popconfirm>
                    </>
                )}
                {((isUsingDefaultSettings && canAdd && isSavingSettings) ||
                    (!isUsingDefaultSettings && isEditingSavedConfig)) && (
                    <Input
                        placeholder="Название"
                        value={settingsName}
                        onChange={handleChangeSettingsName}
                        disabled={isLoading}
                        maxLength={24}
                    />
                )}
            </div>
        </Aligner>
    );
};

export default ConfigSelector;
