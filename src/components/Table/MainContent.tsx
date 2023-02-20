import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import FilterContext from "../../context/FilterContext";
import PaginationContext from "../../context/PaginationContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { Z_TableCellSizes, Z_TablePinOptions } from "../../types/enums";
import Aligner from "../Aligner";
import FilterModal from "../Modal/FilterModal";
import SettingsModal from "../Modal/SettingsModal";
import PaginationWrapper from "../PaginationWrapper";
import ScrollWrapper from "../ScrollWrapper";
import ShadowWrapper from "../ShadowWrapper";
import Body from "./Body";
import Head from "./Head";
import SkeletonFiller from "./SkeletonFiller";
import style from "./Table.module.scss";
import TopBar from "./TopBar";

const MainContent = () => {
    const stateContext = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const propsContext = useContext(PropsContext);
    const paginationContext = useContext(PaginationContext);
    const filterContext = useContext(FilterContext);

    const isConfigLoaded =
        !stateContext.isDefaultConfigLoading && !stateContext.isDefaultConfigLoadingError && configContext.tableConfig;

    const defaultColumnCount = propsContext.loadingConfig?.columnCount || 4;
    const defaultRowCount = propsContext.loadingConfig?.rowCount || 5;

    const [isFullscreen, setFullscreen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);

    const computedLoadingConfig = {
        columnCount:
            propsContext.isDataLoading && isConfigLoaded
                ? configContext.tableConfig?.table.filter((column) => column.visible).length || defaultColumnCount
                : defaultColumnCount,
        rowCount: defaultRowCount,
        noFuncBtnsLeft: propsContext.loadingConfig?.noFuncBtnsLeft || false,
        noFuncBtnsRight: propsContext.loadingConfig?.noFuncBtnsRight || false,
    };

    const toggleFullscreen = () => {
        setFullscreen((prevState) => !prevState);
    };

    const openSettingsModal = () => {
        if (configContext.tableConfig) {
            setSettingsModalOpen(true);
            configContext.setModalTableConfig(configContext.tableConfig);
            configContext.setModalSelectedSavedConfigId(configContext.selectedSavedConfigId);
        }
    };

    const openFilterModal = () => {
        setFilterModalOpen(true);
    };

    useEffect(() => {
        propsContext.paginationConfig?.getData?.(filterContext.queryProps);
    }, [propsContext.dataRefreshTrigger]);

    const fullscreenContainerClasses = [style.fullscreenContainer];
    if (isFullscreen) fullscreenContainerClasses.push(style.active);

    const tableContainerClasses = [
        style.tableContainer,
        style[`size_${configContext.tableConfig?.cellSize || Z_TableCellSizes.enum.MEDIUM}`],
    ];

    const tableClasses = [style.table];
    if (stateContext.isLoading && !stateContext.isError) tableClasses.push(style.loading);
    if (
        stateContext.columnPins.some(
            (tableColumnPin) => tableColumnPin.pin === Z_TablePinOptions.enum.LEFT && tableColumnPin.order !== -1
        ) &&
        stateContext.tableHasLeftShadow
    )
        tableClasses.push(style.withLeftShadow);

    return (
        <div className={fullscreenContainerClasses.join(" ")}>
            <div className={tableContainerClasses.join(" ")}>
                <SettingsModal open={isSettingsModalOpen} setOpen={setSettingsModalOpen} />
                <FilterModal open={isFilterModalOpen} setOpen={setFilterModalOpen} tableTitle={propsContext.tableTitle} />
                <TopBar
                    {...{
                        isFullscreen,
                        computedLoadingConfig,
                        toggleFullscreen,
                        openSettingsModal,
                        openFilterModal,
                    }}
                />
                <PaginationWrapper>
                    <ScrollWrapper isFullscreen={isFullscreen}>
                        <ShadowWrapper>
                            <table className={tableClasses.join(" ")}>
                                {(!stateContext.isDefaultConfigLoadingError || stateContext.isDefaultConfigLoading) && (
                                    <thead style={{ position: "sticky", top: 0, zIndex: 1000 }}>
                                        {!stateContext.isDefaultConfigLoading ? (
                                            <Head />
                                        ) : (
                                            <tr>
                                                <SkeletonFiller columnCount={computedLoadingConfig.columnCount} isHeading />
                                            </tr>
                                        )}
                                    </thead>
                                )}
                                {!stateContext.isError ? (
                                    <tbody>
                                        {!stateContext.isLoading ? (
                                            <Body
                                                data={
                                                    !propsContext.paginationConfig?.singleData
                                                        ? propsContext.data
                                                        : propsContext.data.slice(0, 10)
                                                }
                                            />
                                        ) : (
                                            <PaginationContext.Consumer>
                                                {(pagination) => (
                                                    <SkeletonFiller
                                                        columnCount={computedLoadingConfig.columnCount}
                                                        rowCount={
                                                            isFullscreen
                                                                ? pagination.pageSize
                                                                : computedLoadingConfig.rowCount
                                                        }
                                                    />
                                                )}
                                            </PaginationContext.Consumer>
                                        )}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td
                                                colSpan={(configContext.tableConfig?.table.length || 0) + 1}
                                                className={style.errorContent}
                                                style={{
                                                    padding: 0,
                                                }}
                                            >
                                                <Aligner
                                                    className={style.loadingError}
                                                    style={{
                                                        width: "max-content",
                                                        position: "sticky",
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                    }}
                                                >
                                                    {stateContext.isDefaultConfigLoadingError
                                                        ? propsContext.isDataError
                                                            ? "ОШИБКА ТАБЛИЦЫ И ДАННЫХ"
                                                            : "ОШИБКА ТАБЛИЦЫ"
                                                        : propsContext.isDataError && "ОШИБКА ДАННЫХ"}
                                                </Aligner>
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </ShadowWrapper>
                    </ScrollWrapper>
                </PaginationWrapper>
            </div>
        </div>
    );
};

export default MainContent;
