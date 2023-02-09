import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import UIContext from "../../../context/UIContext";
import Aligner from "../../Aligner";

interface SettingsResetterType {
    isResettedHard: boolean;
    resetSettings: () => void;
    resetHardSettings: () => void;
}

const SettingsResetter = ({ isResettedHard, resetSettings, resetHardSettings }: SettingsResetterType) => {
    const UI = useContext(UIContext);
    const configContext = useContext(ConfigContext);

    const isDefaultSettings =
        JSON.stringify(configContext.modalTableConfig) === JSON.stringify(configContext.defaultTableConfig) &&
        configContext.modalSelectedSavedConfigId === undefined;

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
            <Aligner gutter={8}>
                <UI.SecondaryBtn onClick={resetHardSettings}>
                    <Aligner gutter={6}>
                        <span>По умолчанию</span>
                    </Aligner>
                </UI.SecondaryBtn>
                {isSavedSettings && isSavedSettingsChanged && !isResettedHard && (
                    <UI.SecondaryBtn onClick={resetSettings}>
                        <Aligner gutter={6}>
                            <span>По настройке</span>
                        </Aligner>
                    </UI.SecondaryBtn>
                )}
            </Aligner>
        </Aligner>
    );
};

export default SettingsResetter;
