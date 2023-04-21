import axios, { CancelTokenSource } from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { ERR_CANCELED } from "../../constants/general";
import ConfigContext from "../../context/ConfigContext";
import DataFetchContext from "../../context/DataFetchContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { getFilterFields, getMaxHeadingDepth, getModalFields, parseConfig } from "../../functions/global";
import { TablePinOptions, Z_TablePinOptions } from "../../types/enums";
import {
    ColumnType,
    SavedTableConfigInitialSchema,
    SavedTableConfigInitialType,
    SavedTableConfigType,
    TableConfigType
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

    const defaultControllerRef = useRef<CancelTokenSource>();
    const savedControllerRef = useRef<CancelTokenSource>();

    const requestDefaultConfig = () => {
        stateContext.setDefaultConfigLoading(true);
        dataFetchContext.setDataLoading(true);
        stateContext.setDefaultConfigLoadingError(false);

        const cancelSource = axios.CancelToken.source();
        axios
            .get(defaultConfigPath, { cancelToken: cancelSource.token })
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

                dataFetchContext.setConfigFetched(true);
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
                if (defaultConfig.globalDependField) {
                    dataFetchContext.setGlobalDependField(defaultConfig.globalDependField);
                }
                dataFetchContext.setSignleData(!!defaultConfig.isSingleData);
                dataFetchContext.setFetchResultDataIndex(defaultConfig.fetchResultDataIndex);
                stateContext.setDefaultConfigLoading(false);
            })
            .catch((error) => {
                console.error("--- Error DEFAULT CONFIG ---\n", error.issues ?? error);
                stateContext.setDefaultConfigLoadingError(true);
                dataFetchContext.setDataLoading(false);
                if (error.code !== ERR_CANCELED) {
                    stateContext.setDefaultConfigLoading(false);
                }
            });
        defaultControllerRef.current = cancelSource;
    };

    useEffect(() => {
        requestDefaultConfig();
    }, [defaultConfigPath]);

    const requestSavedConfigs = (defaultConfig = defaultTableConfig) => {
        if (!defaultConfig) return;
        stateContext.setSavedConfigsLoading(true);

        const cancelSource = axios.CancelToken.source();
        dataFetchContext.requester
            .get(propsContext.controllers.get, {
                params: {
                    tableName: propsContext.configPath,
                },
                cancelToken: cancelSource.token,
            })
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
                        dataFetchContext.requester.put(propsContext.controllers.delete, null, {
                            params: { userConfigId: notValidSavedConfig.id },
                        });
                    });
                }

                const recentSavedConfig = computedList.find((savedConfig) => savedConfig.recent === true);
                if (recentSavedConfig) {
                    setModalTableConfig(recentSavedConfig.configParams);
                    setSelectedSavedConfigId(recentSavedConfig.id);
                    setModalSelectedSavedConfigId(recentSavedConfig.id);
                }

                const configToSet = recentSavedConfig?.configParams || defaultConfig;
                setTableConfig(() => configToSet);
                stateContext.setSavedConfigsLoading(false);
                stateContext.setSavedConfigsLoadingError(false);
            })
            .catch((error) => {
                console.error("--- Error SAVED CONFIGS ---");
                stateContext.setSavedConfigsLoadingError(true);
                setTableConfig(() => defaultConfig);
                if (error.code !== ERR_CANCELED) {
                    stateContext.setSavedConfigsLoading(false);
                }
            });
        savedControllerRef.current = cancelSource;
    };

    useEffect(() => {
        return () => {
            defaultControllerRef.current?.cancel();
            savedControllerRef.current?.cancel();
        };
    }, []);

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

                requestDefaultConfig,
                requestSavedConfigs,

                hasLeftPin: checkHasPin(Z_TablePinOptions.enum.LEFT),
                hasRightPin: checkHasPin(Z_TablePinOptions.enum.RIGHT),

                filterConfig,
                modalConfig,

                hasActionColumn:
                    (defaultTableConfig?.creatable && stateContext.canCreate) ||
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
