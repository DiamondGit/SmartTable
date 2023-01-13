import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import UIContext from "../../../context/UIContext";
import Aligner from "../../Aligner";

interface SettingsResetterType {
    resetSettings: () => void;
    resetHardSettings: () => void;
}

const SettingsResetter = ({ resetSettings, resetHardSettings }: SettingsResetterType) => {
    const UI = useContext(UIContext);
    const configContext = useContext(ConfigContext);

    const isTableDefaultSettings =
        JSON.stringify(configContext.tableConfig) === JSON.stringify(configContext.defaultTableConfig);
    const isDefaultSettings =
        JSON.stringify(configContext.modalTableConfig) === JSON.stringify(configContext.defaultTableConfig);
    const isTableSettings = JSON.stringify(configContext.modalTableConfig) === JSON.stringify(configContext.tableConfig);

    if (!((!isDefaultSettings && !isTableDefaultSettings) || !isTableSettings)) return null;
    return (
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
    );
};

export default SettingsResetter;
