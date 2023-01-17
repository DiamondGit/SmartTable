import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { getTableConfig } from "../../controllers/controllers";
import {
    SavedTableConfigType,
    TableConfigSchema,
    TableConfigType,
    TablePinOptions,
    Z_TablePinOptions,
} from "../../types/general";

interface ConfigProviderType {
    children: React.ReactNode;
}

const ConfigProvider = ({ children }: ConfigProviderType) => {
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);
    const [defaultTableConfig, setDefaultTableConfig] = useState<TableConfigType>();
    const [tableConfig, setTableConfig] = useState<TableConfigType>();
    const [modalTableConfig, setModalTableConfig] = useState<TableConfigType>();
    const [savedTableConfigs, setSavedTableConfigs] = useState<SavedTableConfigType[]>([]);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = () => {
        stateContext.setConfigLoading(true);
        stateContext.setConfigLoadingError(false);
        getTableConfig(propsContext.tableName, propsContext.userId)
            .then((res) => {
                const _defaultTableConfig_ = TableConfigSchema.parse(res.defaultTableConfig);
                setDefaultTableConfig(_defaultTableConfig_);

                const _savedTableConfigs_ = res.savedTableConfigs || [];
                setSavedTableConfigs(_savedTableConfigs_);

                const _recentTableConfig_ = _savedTableConfigs_.find((savedTableConfig) => savedTableConfig.isRecent);
                const computedTableConfig = _recentTableConfig_
                    ? TableConfigSchema.parse(_recentTableConfig_)
                    : _defaultTableConfig_;
                setTableConfig(computedTableConfig);
                setModalTableConfig(computedTableConfig);

                console.log("--- Success CONFIG ---");
            })
            .catch((error) => {
                console.log("--- Error CONFIG ---");
                stateContext.setConfigLoadingError(true);
            })
            .finally(() => {
                stateContext.setConfigLoading(false);
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

    return (
        <ConfigContext.Provider
            value={{
                defaultTableConfig: defaultTableConfig,
                savedTableConfigs: savedTableConfigs,
                selectedSavedTableConfigId: null,

                tableConfig: tableConfig,
                setTableConfig: setAndCompareTableConfig,

                modalTableConfig: modalTableConfig,
                setModalTableConfig: setAndCompareTempTableConfig,

                hasLeftPin: checkHasPin(Z_TablePinOptions.enum.LEFT),
                hasRightPin: checkHasPin(Z_TablePinOptions.enum.RIGHT),
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;
