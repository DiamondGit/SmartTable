import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { deleteConfig, getUserConfigs } from "../../controllers/controllers";
import { getMaxHeadingDepth, parseConfig } from "../../functions/global";
import { TablePinOptions, Z_TablePinOptions } from "../../types/enums";
import {
    SavedTableConfigInitialSchema,
    SavedTableConfigInitialType,
    SavedTableConfigType,
    TableConfigType,
} from "../../types/general";

interface ConfigProviderType {
    defaultConfigPath: string;
    children: React.ReactNode;
}

const ConfigProvider = ({ defaultConfigPath, children }: ConfigProviderType) => {
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);

    const [defaultTableConfig, setDefaultTableConfig] = useState<TableConfigType>();
    const [tableConfig, setTableConfig] = useState<TableConfigType>();
    const [modalTableConfig, setModalTableConfig] = useState(tableConfig);

    const [savedTableConfigs, setSavedTableConfigs] = useState<SavedTableConfigType[]>([]);

    const [selectedSavedConfigId, setSelectedSavedConfigId] = useState<number>();
    const [modalSelectedSavedConfigId, setModalSelectedSavedConfigId] = useState(selectedSavedConfigId);

    useEffect(() => {
        stateContext.setDefaultConfigLoading(true);
        stateContext.setDefaultConfigLoadingError(false);

        fetch(defaultConfigPath, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
            .then((response) => response.json())
            .then((json) => parseConfig(json, false))
            .then((defaultConfig) => {
                if (!defaultConfig) throw new Error("parse Error");
                console.log("--- Success DEFAULT CONFIG ---");
                console.log("Computed Default Table:", defaultConfig);
                setDefaultTableConfig(defaultConfig);

                //Get saved configs
                stateContext.setSavedConfigsLoading(true);
                stateContext.setSavedConfigsLoadingError(false);

                stateContext.setMaxHeadingDepth(getMaxHeadingDepth(defaultConfig.table));

                requestSavedConfigs(defaultConfig);
            })
            .catch((error) => {
                console.log("--- Error DEFAULT CONFIG ---");
                stateContext.setDefaultConfigLoadingError(true);
            })
            .finally(() => {
                stateContext.setDefaultConfigLoading(false);
            });
    }, [defaultConfigPath]);

    const requestSavedConfigs = (defaultConfig: TableConfigType | undefined = defaultTableConfig) => {
        if (!defaultConfig) return;
        getUserConfigs(propsContext.tableConfigPath)
            .then((res) => {
                let filteredList = (Array.isArray(res.data) ? res.data : [])
                    .filter((savedConfig) => SavedTableConfigInitialSchema.safeParse(savedConfig).success)
                    .map((savedConfig) => SavedTableConfigInitialSchema.parse(savedConfig)) as SavedTableConfigInitialType[];

                const computedList = filteredList
                    .map((savedConfig) => ({
                        ...savedConfig,
                        configParams: parseConfig(JSON.parse(savedConfig.configParams as string)),
                    }))
                    .filter((parsedConfig) => parsedConfig.configParams !== null)
                    .sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    ) as SavedTableConfigType[];

                console.log("--- Success SAVED CONFIGS ---");
                console.log("Computed Saved Tables:", computedList);
                setSavedTableConfigs(computedList);

                const notValidSavedConfigs = filteredList.filter(
                    (savedConfig) => !computedList.some((computedConfig) => computedConfig.id === savedConfig.id)
                );
                if (notValidSavedConfigs.length > 0) {
                    console.log(`Not valid SAVED CONFIGS`, notValidSavedConfigs);
                    notValidSavedConfigs.forEach((notValidSavedConfig) => {
                        deleteConfig(notValidSavedConfig.id);
                    });
                }

                const recentSavedConfig = computedList.find((savedConfig) => savedConfig.recent === true);
                if (recentSavedConfig) setSelectedSavedConfigId(recentSavedConfig.id);

                const configToSet = recentSavedConfig?.configParams || defaultConfig;
                setTableConfig(configToSet);
            })
            .catch((error) => {
                console.log("--- Error SAVED CONFIGS ---");
                stateContext.setSavedConfigsLoadingError(true);
                setTableConfig(defaultConfig);
            })
            .finally(() => {
                stateContext.setSavedConfigsLoading(false);
            });
    };

    const setAndCompareTempTableConfig = (newTableConfig: TableConfigType) => {
        setModalTableConfig(newTableConfig);
    };

    const setAndCompareTableConfig = (newTableConfig: TableConfigType) => {
        setTableConfig(newTableConfig);
    };

    const checkHasPin = (pinOption: TablePinOptions) => {
        return tableConfig?.table?.some((column) => column.pin === pinOption) || false;
    };

    const getSavedConfigById = (configId: number | undefined) => {
        return savedTableConfigs.find((savedConfig) => savedConfig.id === configId);
    };

    return (
        <ConfigContext.Provider
            value={{
                defaultTableConfig,

                tableConfig,
                setTableConfig: setAndCompareTableConfig,

                modalTableConfig,
                setModalTableConfig: setAndCompareTempTableConfig,

                savedTableConfigs,

                selectedSavedConfigId,
                setSelectedSavedConfigId,

                modalSelectedSavedConfigId,
                setModalSelectedSavedConfigId,

                selectedSavedTableConfigId: null,

                getSavedConfigById,

                requestSavedConfigs,

                hasLeftPin: checkHasPin(Z_TablePinOptions.enum.LEFT),
                hasRightPin: checkHasPin(Z_TablePinOptions.enum.RIGHT),
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;
