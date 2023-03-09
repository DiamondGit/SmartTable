import { Button } from "antd";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import SettingsContext from "../../../context/SettingsContext";
import Aligner from "../../Aligner";

interface SettingsResetterType {
    isDefaultSettings: boolean;
    isResettedHard: boolean;
    resetSettings: () => void;
    resetHardSettings: () => void;
}

const SettingsResetter = ({ isDefaultSettings, isResettedHard, resetSettings, resetHardSettings }: SettingsResetterType) => {
    const configContext = useContext(ConfigContext);
    const { isLoading, isEditingSavedConfig } = useContext(SettingsContext);

    const activeSavedConfig = configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId);

    const isSavedSettings = configContext.modalSelectedSavedConfigId !== undefined;
    const isSavedSettingsChanged = activeSavedConfig
        ? JSON.stringify(activeSavedConfig?.configParams) !== JSON.stringify(configContext.modalTableConfig)
        : false;

    if (isDefaultSettings && !isSavedSettings) return null;
    return (
        <Aligner style={{ alignItems: "flex-end" }} isVertical gutter={8}>
            <Aligner style={{ justifyContent: "flex-start" }} gutter={4}>
                {isEditingSavedConfig ? "Сбросить настройки:" : "Вернуться к настройкам:"}
            </Aligner>
            <Aligner style={{ flexDirection: "row-reverse", justifyContent: "flex-start" }} gutter={8}>
                <Button onClick={resetHardSettings} disabled={isLoading || (isEditingSavedConfig && isDefaultSettings)}>
                    По умолчанию
                </Button>
                {isEditingSavedConfig && (
                    <Button
                        onClick={resetSettings}
                        disabled={isLoading || (isSavedSettings && (!isSavedSettingsChanged || isResettedHard))}
                    >
                        {`По настройке "${activeSavedConfig?.configName}"`}
                    </Button>
                )}
            </Aligner>
        </Aligner>
    );
};

export default SettingsResetter;
