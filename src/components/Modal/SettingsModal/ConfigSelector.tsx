import { FormControl, FormLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import ConfigContext from "../../../context/ConfigContext";
import { useContext } from "react";
import Aligner from "../../Aligner";

const ConfigSelector = ({ isEditingSavedConfig }: { isEditingSavedConfig: boolean }) => {
    const configContext = useContext(ConfigContext);

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
                configContext.setModalTableConfig(selectedConfig);
                configContext.setModalSelectedSavedConfigId(selectedId);
            } else {
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
                disabled={isEditingSavedConfig}
            >
                <MenuItem value={defaultOption}>
                    <em>None</em>
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
