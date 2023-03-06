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
    const { isLoading } = useContext(SettingsContext);

    const activeSavedConfig = configContext.getSavedConfigById(configContext.modalSelectedSavedConfigId);

    const isSavedSettings = configContext.modalSelectedSavedConfigId !== undefined;
    const isSavedSettingsChanged = activeSavedConfig
        ? JSON.stringify(activeSavedConfig?.configParams) !== JSON.stringify(configContext.modalTableConfig)
        : false;

    if (isDefaultSettings) return null;
    return (
        <Aligner style={{ alignItems: "flex-end" }} isVertical gutter={8}>
            <Aligner style={{ justifyContent: "flex-start" }} gutter={4}>
                Сбросить настройки:
            </Aligner>
            <Aligner style={{ flexDirection: "row-reverse", justifyContent: "flex-start" }} gutter={8}>
                <Button onClick={resetHardSettings} disabled={isLoading}>
                    <Aligner gutter={6}>
                        <span>По умолчанию</span>
                    </Aligner>
                </Button>
                {isSavedSettings && isSavedSettingsChanged && !isResettedHard && (
                    <Button onClick={resetSettings} disabled={isLoading}>
                        <Aligner gutter={6}>
                            <span>{`По настройке "${activeSavedConfig?.configName}"`}</span>
                        </Aligner>
                    </Button>
                )}
            </Aligner>
        </Aligner>
    );
};

export default SettingsResetter;
