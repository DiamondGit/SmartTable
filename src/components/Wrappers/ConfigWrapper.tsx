import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { getTableConfig } from "../../controllers/controllers";
import { SavedTableConfigType, TableConfigSchema, TableConfigType } from "../../types/general";

interface ConfigWrapperType {
    children: React.ReactNode;
}

const ConfigWrapper = ({ children }: ConfigWrapperType) => {
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

    const setAndCompareTempTableConfig = (newTableConfig: TableConfigType, isResetHard = false) => {
        setModalTableConfig(newTableConfig);
    };

    const setAndCompareTableConfig = (newTableConfig: TableConfigType) => {
        setTableConfig(newTableConfig);
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
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigWrapper;
