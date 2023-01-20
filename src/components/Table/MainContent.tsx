import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { getTableData } from "../../controllers/controllers";
import { useScrollWithShadow } from "../../functions/useScrollWithShadow";
import { Z_TableCellSizes, Z_TablePinOptions } from "../../types/enums";
import Aligner from "../Aligner";
import FilterModal from "../Modal/FilterModal";
import SettingsModal from "../Modal/SettingsModal";
import PaginationWrapper from "../PaginationWrapper";
import Head from "./Head";
import SkeletonFiller from "./SkeletonFiller";
import style from "./Table.module.scss";
import Body from "./Body";
import TopBar from "./TopBar";
import ShadowWrapper from "../ShadowWrapper";

const MainContent = () => {
    const stateContext = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const propsContext = useContext(PropsContext);
    const isConfigLoaded = !stateContext.isConfigLoading && !stateContext.isConfigLoadingError && configContext.tableConfig;
    const defaultColumnCount = propsContext.loadingConfig?.columnCount || 4;

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(0);

    const [isFullscreen, setFullscreen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);

    const computedLoadingConfig = {
        columnCount:
            stateContext.isDataLoading && isConfigLoaded
                ? configContext.tableConfig?.table.filter((column) => column.visible).length || defaultColumnCount
                : defaultColumnCount,
        rowCount: propsContext.loadingConfig?.rowCount || 5,
        noFuncBtnsLeft: propsContext.loadingConfig?.noFuncBtnsLeft || false,
        noFuncBtnsRight: propsContext.loadingConfig?.noFuncBtnsRight || false,
    };

    const fetchData = () => {
        stateContext.setDataLoading(true);
        stateContext.setDataLoadingError(false);
        getTableData(propsContext.tableName, propsContext.userId)
            .then((res) => {
                stateContext.setData(res);
                console.log("--- Success DATA ---");
            })
            .catch((error) => {
                console.log("--- Error DATA ---");
                stateContext.setDataLoadingError(true);
            })
            .finally(() => {
                stateContext.setDataLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleFullscreen = () => {
        setFullscreen((prevState) => !prevState);
    };

    const openSettingsModal = () => {
        if (configContext.tableConfig) {
            setSettingsModalOpen(true);
            configContext.setModalTableConfig(configContext.tableConfig);
        }
    };

    const openFilterModal = () => {
        setFilterModalOpen(true);
    };

    const handleChangePage = (newPage: number) => {
        if (propsContext.paginationConfig?.perPageFetch) {
            console.log("--- FETCH NEW DATA ---");
        }
        setCurrentPage(newPage);
    };

    const fullscreenContainerClasses = [style.fullscreenContainer];
    if (isFullscreen) fullscreenContainerClasses.push(style.active);

    const tableContainerClasses = [
        style.tableContainer,
        style[`size_${configContext.tableConfig?.cellSize || Z_TableCellSizes.enum.MEDIUM}`],
    ];

    const tableClasses = [style.table];
    if (stateContext.isLoading && !stateContext.isError) tableClasses.push(style.loading);
    if (
        stateContext.columnPins.some((tableColumnPin) => tableColumnPin.pin === Z_TablePinOptions.enum.LEFT && tableColumnPin.order !== -1) &&
        stateContext.tableHasLeftShadow
    )
        tableClasses.push(style.withLeftShadow);

    const slicedDataStartIndex = (currentPage - 1) * pageSize;

    const headingRef = useRef<HTMLTableSectionElement>(null);
    const headingRowRef = useRef<HTMLTableRowElement>(null);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeadingPosition = () => {
            if (headingRef.current?.getBoundingClientRect().top === undefined || !headingRowRef.current) return;

            const newVal = headingRef.current?.getBoundingClientRect().top;
            const computedVal = newVal < 0 ? Math.abs(newVal) : 0;

            headingRowRef.current.style.top = `${computedVal}px`;
        };
        const fullscreenContainer = fullscreenContainerRef.current;
        window.addEventListener("scroll", updateHeadingPosition);
        fullscreenContainer?.addEventListener("scroll", updateHeadingPosition);
        return () => {
            window.removeEventListener("scroll", updateHeadingPosition);
            fullscreenContainer?.removeEventListener("scroll", updateHeadingPosition);
        };
    }, []);

    return (
        <div className={fullscreenContainerClasses.join(" ")} ref={fullscreenContainerRef}>
            <div className={tableContainerClasses.join(" ")}>
                <SettingsModal open={isSettingsModalOpen} setOpen={setSettingsModalOpen} />
                <FilterModal open={isFilterModalOpen} setOpen={setFilterModalOpen} tableTitle={propsContext.tableTitle} />
                <TopBar
                    isFullscreen={isFullscreen}
                    computedLoadingConfig={computedLoadingConfig}
                    toggleFullscreen={toggleFullscreen}
                    openSettingsModal={openSettingsModal}
                    openFilterModal={openFilterModal}
                />
                <PaginationWrapper
                    total={stateContext.data.length}
                    current={currentPage}
                    handlePageChange={handleChangePage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    openFilterModal={openFilterModal}
                >
                    <ShadowWrapper>
                        <table className={tableClasses.join(" ")}>
                            {(!stateContext.isError || stateContext.isConfigLoading) && (
                                <thead ref={headingRef}>
                                        {!stateContext.isConfigLoading ? (
                                            <Head />
                                        ) : (
                                            <tr ref={headingRowRef}>
                                                <SkeletonFiller columnCount={computedLoadingConfig.columnCount} isHeading />
                                            </tr>
                                        )}
                                </thead>
                            )}
                            {!stateContext.isError || stateContext.isConfigLoading ? (
                                <tbody>
                                    {!stateContext.isLoading ? (
                                        <Body
                                            data={
                                                propsContext.paginationConfig?.perPageFetch
                                                    ? stateContext.data
                                                    : stateContext.data.slice(
                                                          slicedDataStartIndex,
                                                          slicedDataStartIndex + pageSize
                                                      )
                                            }
                                        />
                                    ) : (
                                        <SkeletonFiller
                                            columnCount={computedLoadingConfig.columnCount}
                                            rowCount={computedLoadingConfig.rowCount}
                                        />
                                    )}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td
                                            className={style.errorContent}
                                            style={{
                                                padding: 0,
                                            }}
                                        >
                                            <Aligner className={style.loadingError}>
                                                {stateContext.isConfigLoadingError
                                                    ? stateContext.isDataLoadingError
                                                        ? "ОШИБКА ТАБЛИЦЫ И ДАННЫХ"
                                                        : "ОШИБКА ТАБЛИЦЫ"
                                                    : stateContext.isDataLoadingError && "ОШИБКА ДАННЫХ"}
                                            </Aligner>
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </ShadowWrapper>
                </PaginationWrapper>
            </div>
        </div>
    );
};

export default MainContent;
