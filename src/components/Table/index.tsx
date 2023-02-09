import { ConfigProvider as AntdConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import UIContext from "../../context/UIContext";
import "../../styles/global.scss";
import { TableCreateType, TableInitializationType } from "../../types/general";
import { TableUIType } from "../../types/UI";
import ConfigProvider from "../Providers/ConfigProvider";
import FilterProvider from "../Providers/FilterProvider";
import PropsProvider from "../Providers/PropsProvider";
import StateProvider from "../Providers/StateProvider";
import MainContent from "./MainContent";

type TableStartingType = TableInitializationType &
    TableCreateType & {
        customUI: TableUIType;
    };

const Table = ({ customUI, ...props }: TableStartingType) => {
    const defaultConfigPath = `${props.configsStoragePath}/${props.tableConfigPath}.json`;

    return (
        <PropsProvider {...{ props }}>
            <StateProvider>
                <ConfigProvider {...{ defaultConfigPath }}>
                    <FilterProvider>
                        <UIContext.Provider value={customUI}>
                            <AntdConfigProvider
                                theme={{
                                    token: {
                                        colorPrimary: "#223c60",
                                    },
                                }}
                                locale={ruRU}
                            >
                                <MainContent />
                            </AntdConfigProvider>
                        </UIContext.Provider>
                    </FilterProvider>
                </ConfigProvider>
            </StateProvider>
        </PropsProvider>
    );
};

export default Table;
