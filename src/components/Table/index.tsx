import { ConfigProvider as AntdConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import UIContext from "../../context/UIContext";
import "../../styles/global.scss";
import { TableCreateType, TableInitializationType } from "../../types/general";
import { TableUIType } from "../../types/UI";
import ConfigProvider from "../Providers/ConfigProvider";
import FilterProvider from "../Providers/FilterProvider";
import PaginationProvider from "../Providers/PaginationProvider";
import PropsProvider from "../Providers/PropsProvider";
import StateProvider from "../Providers/StateProvider";
import MainContent from "./MainContent";

type TableStartingType = TableInitializationType &
    TableCreateType & {
        customUI: TableUIType;
    };

const Table = ({ customUI, ...props }: TableStartingType) => {
    return (
        <PropsProvider {...{ props }}>
            <StateProvider>
                <ConfigProvider {...{ defaultConfigPath: `${props.configsStoragePath}/${props.configPath}.json` }}>
                    <PaginationProvider>
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
                    </PaginationProvider>
                </ConfigProvider>
            </StateProvider>
        </PropsProvider>
    );
};

export default Table;
