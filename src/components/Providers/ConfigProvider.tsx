import axios from "axios";
import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import DataFetchContext from "../../context/DataFetchContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { deleteConfig, getUserConfigs } from "../../controllers/controllers";
import { getFilterFields, getMaxHeadingDepth, getModalFields, parseConfig } from "../../functions/global";
import { TablePinOptions, Z_TablePinOptions } from "../../types/enums";
import {
    ColumnType,
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
    const propsContext = useContext(PropsContext);
    const stateContext = useContext(StateContext);
    const dataFetchContext = useContext(DataFetchContext);

    const [defaultTableConfig, setDefaultTableConfig] = useState<TableConfigType>();
    const [tableConfig, setTableConfig] = useState<TableConfigType>();
    const [modalTableConfig, setModalTableConfig] = useState(tableConfig);

    const [filterConfig, setFilterConfig] = useState<ColumnType[]>([]);
    const [modalConfig, setModalConfig] = useState<ColumnType[]>([]);

    const [savedTableConfigs, setSavedTableConfigs] = useState<SavedTableConfigType[]>([]);

    const [selectedSavedConfigId, setSelectedSavedConfigId] = useState<number>();
    const [modalSelectedSavedConfigId, setModalSelectedSavedConfigId] = useState(selectedSavedConfigId);

    useEffect(() => {
        stateContext.setDefaultConfigLoading(true);
        stateContext.setDefaultConfigLoadingError(false);
        dataFetchContext.setDataLoading(true);

        axios
            .get(defaultConfigPath)
            .then((json) => parseConfig(json.data, false))
            .then((defaultConfig) => {
                if (!defaultConfig) throw new Error("parse Error");
                console.log("--- Success DEFAULT CONFIG ---\n", "Computed Default Table:\n", defaultConfig);
                setDefaultTableConfig(defaultConfig);

                stateContext.setMaxHeadingDepth(getMaxHeadingDepth(defaultConfig.table));

                setFilterConfig(getFilterFields(defaultConfig.table));
                setModalConfig(getModalFields(defaultConfig.table));

                if (defaultConfig.table.length === 0) stateContext.setDefaultConfigLoadingError(true);

                setTableConfig(() => defaultConfig);
                requestSavedConfigs(defaultConfig);

                if (defaultConfig.dataGetApi) {
                    dataFetchContext.setDataGetApi(defaultConfig.dataGetApi);
                    dataFetchContext.getData({});
                }
                if (defaultConfig.dataCreateApi) {
                    dataFetchContext.setDataCreateApi(defaultConfig.dataCreateApi);
                }
                if (defaultConfig.dataUpdateApi) {
                    dataFetchContext.setDataUpdateApi(defaultConfig.dataUpdateApi);
                }
                if (defaultConfig.dataDeleteApi) {
                    dataFetchContext.setDataDeleteApi(defaultConfig.dataDeleteApi);
                }
            })
            .catch((error) => {
                console.log("--- Error DEFAULT CONFIG ---\n", error.issues ?? error);
                stateContext.setDefaultConfigLoadingError(true);
                dataFetchContext.setDataLoading(false);
            })
            .finally(() => {
                stateContext.setDefaultConfigLoading(false);
            });
    }, [defaultConfigPath]);

    const requestSavedConfigs = (defaultConfig = defaultTableConfig) => {
        if (!defaultConfig) return;
        stateContext.setSavedConfigsLoading(true);
        stateContext.setSavedConfigsLoadingError(false);

        getUserConfigs(propsContext.configPath)
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

                console.log("--- Success SAVED CONFIGS ---\n", "Computed Saved Tables:\n", computedList);
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
                setTableConfig(() => configToSet);
            })
            .catch((error) => {
                console.log("--- Error SAVED CONFIGS ---");
                stateContext.setSavedConfigsLoadingError(true);
                setTableConfig(() => defaultConfig);
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

                filterConfig,
                modalConfig,

                hasActionColumn:
                    (defaultTableConfig?.addable && stateContext.canCreate) ||
                    (defaultTableConfig?.updatable && stateContext.canUpdate) ||
                    (defaultTableConfig?.deletable && stateContext.canDelete) ||
                    false,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;
