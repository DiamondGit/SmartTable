import { ConfigProvider as AntdConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import "../../styles/global.scss";
import { TableCreateType, TableInitializationType } from "../../types/general";
import ConfigProvider from "../Providers/ConfigProvider";
import DataFetchProvider from "../Providers/DataFetchProvider";
import FilterProvider from "../Providers/FilterProvider";
import PaginationProvider from "../Providers/PaginationProvider";
import PropsProvider from "../Providers/PropsProvider";
import StateProvider from "../Providers/StateProvider";
import MainContent from "./MainContent";

type TableStartingType = TableInitializationType & TableCreateType;

const Table = ({ ...props }: TableStartingType) => {
    return (
        <PropsProvider {...{ props }}>
            <StateProvider>
                <DataFetchProvider>
                    <ConfigProvider {...{ defaultConfigPath: `${props.configsStoragePath}/${props.configPath}.json` }}>
                        <PaginationProvider>
                            <FilterProvider>
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
                            </FilterProvider>
                        </PaginationProvider>
                    </ConfigProvider>
                </DataFetchProvider>
            </StateProvider>
        </PropsProvider>
    );
};

export default Table;
