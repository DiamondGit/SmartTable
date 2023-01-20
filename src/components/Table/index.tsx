import { ConfigProvider as AntdConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import UIContext from "../../context/UIContext";
import "../../styles/global.scss";
import {
    TableInitializationType
} from "../../types/general";
import { TableUIType } from "../../types/UI";
import ConfigProvider from "../Providers/ConfigProvider";
import FilterProvider from "../Providers/FilterProvider";
import PropsProvider from "../Providers/PropsProvider";
import StateProvider from "../Providers/StateProvider";
import MainContent from "./MainContent";

interface TableStartingType extends TableInitializationType {
    UI: TableUIType;
}

const Table = ({ UI, ...props }: TableStartingType) => {
    return (
        <PropsProvider props={props}>
            <StateProvider>
                <ConfigProvider>
                    <FilterProvider>
                        <UIContext.Provider value={UI}>
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
