import { ConfigProvider as AntdConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import UIContext from "../../context/UIContext";
import "../../styles/global.scss";
import {
    TableInitializationType, TableUIType
} from "../../types/general";
import ConfigWrapper from "../Wrappers/ConfigWrapper";
import FilterWrapper from "../Wrappers/FilterWrapper";
import PropsWrapper from "../Wrappers/PropsWrapper";
import StateWrapper from "../Wrappers/StateWrapper";
import MainContent from "./MainContent";

interface TableStartingType extends TableInitializationType {
    UI: TableUIType;
}

const Table = ({ UI, ...props }: TableStartingType) => {
    return (
        <PropsWrapper props={props}>
            <StateWrapper>
                <ConfigWrapper>
                    <FilterWrapper>
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
                    </FilterWrapper>
                </ConfigWrapper>
            </StateWrapper>
        </PropsWrapper>
    );
};

export default Table;
