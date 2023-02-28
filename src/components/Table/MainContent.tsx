import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import DataContext from "../../context/DataContext";
import DataFetchContext from "../../context/DataFetchContext";
import FilterContext from "../../context/FilterContext";
import PaginationContext from "../../context/PaginationContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { requester } from "../../controllers/controllers";
import { getDeepValue } from "../../functions/global";
import { ModalTypes, Z_ModalTypes, Z_SortOptions, Z_TableCellSizes, Z_TablePinOptions } from "../../types/enums";
import { GeneralObject } from "../../types/general";
import Aligner from "../Aligner";
import DataModal from "../Modal/DataModal";
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
    const dataFetchContext = useContext(DataFetchContext);
    const stateContext = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const propsContext = useContext(PropsContext);
    const filterContext = useContext(FilterContext);
    const paginationContext = useContext(PaginationContext);

    const isConfigLoaded =
        !stateContext.isDefaultConfigLoading && !stateContext.isDefaultConfigLoadingError && configContext.tableConfig;

    const defaultColumnCount = propsContext.loadingConfig?.columnCount || 4;
    const defaultRowCount = propsContext.loadingConfig?.rowCount || 5;

    const [isFullscreen, setFullscreen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [isDataModalOpen, setDataModalOpen] = useState(false);
    const [dataModalType, setDataModalType] = useState<ModalTypes>(Z_ModalTypes.enum.ADD);

    const [modalData, setModalData] = useState<GeneralObject>({});
    const [dataFieldLists, setDataFieldLists] = useState<{ [key: string]: any[] }>({});
    const [dataFieldLoadings, setDataFieldLoadings] = useState<{ [key: string]: boolean }>({});
    const [dataOldValues, setDataOldValues] = useState<{ [key: string]: boolean }>({});
    const [dataFieldErrors, setDataFieldErrors] = useState<{ [key: string]: string }>({});

    const [dataListToDelete, setDataListToDelete] = useState<number[]>([]);
    const [isSelectingToDelete, setSelectingToDelete] = useState(false);
    const [isDeleting, setDeleting] = useState(false);
    const [isDeletingError, setDeletingError] = useState(false);
    const [isFetchRequired, setFetchRequired] = useState(false);
    const [isCancelingDelete, setCancelingDelete] = useState(false);
    const [availableData, setAvailableData] = useState<any[]>([]);

    useEffect(() => {
        setAvailableData(dataFetchContext.data);
    }, [dataFetchContext.data]);

    const computedLoadingConfig = {
        columnCount:
            dataFetchContext.isDataLoading && isConfigLoaded
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

    const openDataModal = (modalType: ModalTypes, dataRow: GeneralObject = {}) => {
        setDataModalOpen(true);
        if (JSON.stringify(dataRow) === "{}") {
            setModalData(dataRow);
            setDataOldValues({});
        } else {
            const computedDataRow: GeneralObject = { id: dataRow.id };
            configContext.modalConfig.forEach((modalField) => {
                if (modalField.field?.dataIndex_read && modalField.field?.dataIndex_write) {
                    const value = getDeepValue(dataRow, modalField.field.dataIndex_read);
                    computedDataRow[modalField.field.dataIndex_write] = !!modalField.displayOptionDataIndex
                        ? value
                            ? value.toString()
                            : value
                        : value;
                }
            });
            setModalData(computedDataRow);
            setDataOldValues(computedDataRow);
        }
        setDataModalType(modalType);
    };

    useEffect(() => {
        setSelectingToDelete(false);
        setCancelingDelete(false);
        setDataListToDelete([]);
        setDeletingError(false);
        dataFetchContext.getData(filterContext.queryProps);
    }, [dataFetchContext.dataGetApi, propsContext.dataRefreshTrigger]);

    const fullscreenContainerClasses = [style.fullscreenContainer];
    if (isFullscreen) fullscreenContainerClasses.push(style.active);

    const tableContainerClasses = [
        style.tableContainer,
        style[`size_${configContext.tableConfig?.cellSize || Z_TableCellSizes.enum.MEDIUM}`],
    ];

    const tableClasses = [style.table];
    if (
        (stateContext.isDefaultConfigLoading || dataFetchContext.isDataLoading) &&
        !(stateContext.isDefaultConfigLoadingError || dataFetchContext.isDataError)
    )
        tableClasses.push(style.loading);
    if (
        stateContext.columnPins.some(
            (tableColumnPin) => tableColumnPin.pin === Z_TablePinOptions.enum.LEFT && tableColumnPin.order !== -1
        ) &&
        stateContext.tableHasLeftShadow
    )
        tableClasses.push(style.withLeftShadow);

    const currentData = isSelectingToDelete ? availableData : propsContext.data || dataFetchContext.data || [];

    return (
        <DataContext.Provider
            value={{
                modalData,
                setModalData,

                openDataModal,

                dataFieldLists,
                setDataFieldLists,

                dataFieldLoadings,
                setDataFieldLoadings,

                dataOldValues,
                setDataOldValues,

                dataFieldErrors,
                setDataFieldErrors,

                dataListToDelete,
                setDataListToDelete,

                isSelectingToDelete,
                setSelectingToDelete,

                isDeleting,
                setDeleting,

                isDeletingError,
                setDeletingError,

                isFetchRequired,
                setFetchRequired,

                isCancelingDelete,
                setCancelingDelete,

                availableData,
                setAvailableData,
            }}
        >
            <div className={fullscreenContainerClasses.join(" ")}>
                <div className={tableContainerClasses.join(" ")}>
                    <SettingsModal open={isSettingsModalOpen} setOpen={setSettingsModalOpen} />
                    <FilterModal open={isFilterModalOpen} setOpen={setFilterModalOpen} />
                    <DataModal modalType={dataModalType} open={isDataModalOpen} setOpen={setDataModalOpen} />
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
                                                    <SkeletonFiller
                                                        columnCount={computedLoadingConfig.columnCount}
                                                        isHeading
                                                    />
                                                </tr>
                                            )}
                                        </thead>
                                    )}
                                    {!(stateContext.isDefaultConfigLoadingError || dataFetchContext.isDataError) ? (
                                        <tbody>
                                            {!(stateContext.isDefaultConfigLoading) ? (
                                                <Body
                                                    data={
                                                        !propsContext.paginationConfig?.singleData
                                                            ? currentData
                                                            : currentData.slice(0, 10)
                                                    }
                                                    defaultRowCount={computedLoadingConfig.rowCount}
                                                />
                                            ) : (
                                                <SkeletonFiller
                                                    columnCount={computedLoadingConfig.columnCount}
                                                    rowCount={
                                                        isFullscreen
                                                            ? paginationContext.pageSize
                                                            : computedLoadingConfig.rowCount
                                                    }
                                                />
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
                                                            ? dataFetchContext.isDataError
                                                                ? "ОШИБКА ТАБЛИЦЫ И ДАННЫХ"
                                                                : "ОШИБКА ТАБЛИЦЫ"
                                                            : dataFetchContext.isDataError && "ОШИБКА ДАННЫХ"}
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
        </DataContext.Provider>
    );
};

export default MainContent;
