import { MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import SettingsContext from "../../../context/SettingsContext";
import Aligner from "../../Aligner";

const ConfigSelector = ({ isEditingSavedConfig }: { isEditingSavedConfig: boolean }) => {
    const configContext = useContext(ConfigContext);
    const { isLoading, setConfigEditable } = useContext(SettingsContext);

    const defaultOption = `${undefined}`;

    const handleSetDefaultConfig = () => {
        if (configContext.defaultTableConfig) {
            configContext.setModalSelectedSavedConfigId(undefined);
            configContext.setModalTableConfig(configContext.defaultTableConfig);
        }
    };

    const handleChange = (event: SelectChangeEvent) => {
        const result = event.target.value;
        if (result === defaultOption) {
            handleSetDefaultConfig();
        } else {
            const selectedId = parseInt(result);
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
        <Aligner style={{ justifyContent: "flex-start", width: "50%", flexWrap: "nowrap" }}>
            <Typography width={100}>Сохраненные настройки ({configContext.savedTableConfigs.length})</Typography>
            <Select
                fullWidth
                value={`${configContext.modalSelectedSavedConfigId}`}
                onChange={handleChange}
                displayEmpty
                size="small"
                disabled={isEditingSavedConfig || isLoading}
            >
                <MenuItem value={defaultOption}>
                    <em>По умолчанию</em>
                </MenuItem>
                {configContext.savedTableConfigs.map((savedTableConfig) => (
                    <MenuItem value={savedTableConfig.id} key={savedTableConfig.configName}>
                        {savedTableConfig.configName}
                    </MenuItem>
                ))}
            </Select>
        </Aligner>
    );
};

export default ConfigSelector;
