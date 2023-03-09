import { Button, message, Row } from "antd";
import axios, { CancelTokenSource } from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import Modal, { ModalType } from "..";
import { ErrorText } from "../../../constants/UI";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import DataFetchContext from "../../../context/DataFetchContext";
import FieldModalContext, {
    FieldActionType,
    FieldFieldConfigType,
    FieldModalConfigType,
} from "../../../context/FieldModalContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import { requester } from "../../../controllers/controllers";
import { getModalTitle } from "../../../functions/global";
import { ModalTypes, TableFieldTypes, Z_DependencyTypes, Z_ModalTypes, Z_TableFieldTypes } from "../../../types/enums";
import { GeneralObject } from "../../../types/general";
import Aligner from "../../Aligner";
import FieldItem from "./FieldItem";

type FieldModalType = {
    modalType: ModalTypes;
    isModalOpen: boolean;
    setModalOpen: (state: boolean) => void;
};

const FieldModal = ({ modalType, isModalOpen, setModalOpen }: FieldModalType) => {
    const dataFetchContext = useContext(DataFetchContext);
    const filterContext = useContext(FilterContext);
    const configContext = useContext(ConfigContext);
    const dataContext = useContext(DataContext);
    const propsContext = useContext(PropsContext);

    const isAddModal = modalType === Z_ModalTypes.enum.ADD;
    const isAddBasedModal = modalType === Z_ModalTypes.enum.ADD_BASED;
    const isUpdateModal = modalType === Z_ModalTypes.enum.UPDATE;
    const isDataModal = isAddModal || isAddBasedModal || isUpdateModal;
    const isFilterModal = modalType === Z_ModalTypes.enum.FILTER;

    const hasCreateApi = !!configContext.defaultTableConfig?.dataCreateApi;
    const hasUpdateApi = !!configContext.defaultTableConfig?.dataUpdateApi;

    const showDataChangedIcon = isAddBasedModal || isUpdateModal;

    let modalConfig: FieldModalConfigType = "modalConfig";
    if (isFilterModal) modalConfig = "filterConfig";

    let config: FieldFieldConfigType = "field";
    if (isFilterModal) config = "filterField";

    const [modalLoading, setModalLoading] = useState(false);

    const closeModal = () => {
        setModalOpen(false);

        if (isFilterModal) {
            setModalFilterValue(filterContext.filterValues);
        } else {
            dataContext.setModalData(() => ({}));
            dataContext.setDataFieldErrors(() => ({}));
        }
    };

    const handleConfirm = () => {
        if ((isAddModal || isAddBasedModal) && configContext.defaultTableConfig?.dataCreateApi) {
            setModalLoading(true);
            dataFetchContext
                .createData(dataContext.modalData)
                .then(() => {
                    message.success("Добавлено");
                    dataFetchContext.getData(filterContext.queryProps);
                    closeModal();
                })
                .catch((error) => {
                    if (error.response?.data?.errors) {
                        dataContext.setDataFieldErrors(error.response.data.errors);
                    }
                })
                .finally(() => {
                    setModalLoading(false);
                });
        } else if (isUpdateModal && configContext.defaultTableConfig?.dataUpdateApi) {
            setModalLoading(true);
            dataFetchContext
                .updateData(dataContext.modalData)
                .then(() => {
                    message.success("Изменено");
                    dataFetchContext.getData(filterContext.queryProps);
                    closeModal();
                })
                .catch((error) => {
                    if (error.response?.data?.errors) {
                        dataContext.setDataFieldErrors(error.response.data.errors);
                    }
                })
                .finally(() => {
                    setModalLoading(false);
                });
        } else if (isFilterModal) {
            const computedFilterValues: GeneralObject = {};
            Object.keys(VALUES).forEach((filterField) => {
                if (
                    VALUES[filterField] !==
                    configContext[modalConfig].find((field) => field[config]?.dataIndex_write === filterField)?.[config]
                        ?.initValue
                ) {
                    computedFilterValues[filterField] = VALUES[filterField];
                }
            });

            dataFetchContext.getData({
                ...filterContext.queryProps,
                filters: computedFilterValues,
            });

            setModalOpen(false);
            setFilterValue(computedFilterValues);
            setModalFilterValue(computedFilterValues);
        }
    };

    const handleCancel = () => {
        closeModal();
    };

    const resetFilters = () => {
        setModalFilterValue({});
    };

    const LeftFooter = () => {
        if (isDataModal) {
            if ((isAddModal || isAddBasedModal) && !hasCreateApi) {
                return <ErrorText text="Отсутствует API создания данных!" />;
            } else if (isUpdateModal && !hasUpdateApi) {
                return <ErrorText text="Отсутствует API изменения данных!" />;
            } else if (dataContext.dataFieldErrors.error !== undefined) {
                return <ErrorText text={dataContext.dataFieldErrors.error} />;
            }
        } else if (isFilterModal) {
            if (JSON.stringify(filterContext.modalFilterValues) !== "{}") {
                return <Button onClick={resetFilters}>Сбросить</Button>;
            }
        }
        return null;
    };

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                {getModalTitle(modalType, propsContext.tableTitle)}
            </Aligner>
        ),
        open: isModalOpen,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        type: modalType,
        width: 700,
        closable: !modalLoading,
        leftFooter: <LeftFooter />,
        rightFooter: isDataModal ? (
            <>
                <Button onClick={handleCancel} disabled={modalLoading}>
                    Отмена
                </Button>
                <Button
                    type="primary"
                    onClick={handleConfirm}
                    loading={modalLoading}
                    disabled={(isAddModal || isAddBasedModal) ? !hasCreateApi : isUpdateModal ? !hasUpdateApi : false}
                >
                    {(isAddModal || isAddBasedModal) ? "Добавить" : isUpdateModal ? "Изменить" : "Сохранить"}
                </Button>
            </>
        ) : isFilterModal ? (
            <>
                <Button onClick={handleCancel}>Отмена</Button>
                <Button type="primary" onClick={handleConfirm}>Применить</Button>
            </>
        ) : null,
    };

    const LOADINGS = isFilterModal ? filterContext.filterFieldLoadings : dataContext.dataFieldLoadings;
    const LISTS = isFilterModal ? filterContext.filterFieldLists : dataContext.dataFieldLists;
    const VALUES = isFilterModal ? filterContext.modalFilterValues : dataContext.modalData;
    const CONTROLLERS = isFilterModal ? filterContext.filterFieldControllers : dataContext.dataFieldControllers;

    const cleanLoadings = () => {
        if (isFilterModal) {
            filterContext.setFilterFieldLoadings(() => ({}));
        } else {
            dataContext.setDataFieldLoadings(() => ({}));
        }
    };
    const setLoadingByDataIndex = (dataIndex: string | undefined, value: boolean) => {
        if (dataIndex) {
            if (isFilterModal) {
                filterContext.setFilterFieldLoadings((prevLoadings) => ({
                    ...prevLoadings,
                    [dataIndex]: value,
                }));
            } else {
                dataContext.setDataFieldLoadings((prevLoadings) => ({
                    ...prevLoadings,
                    [dataIndex]: value,
                }));
            }
        }
    };
    const cleanLists = () => {
        if (isFilterModal) {
            filterContext.setFilterFieldLists(() => ({}));
        } else {
            dataContext.setDataFieldLists(() => ({}));
        }
    };
    const setListByDataIndex = (dataIndex: string | undefined, value: any[]) => {
        if (dataIndex) {
            if (isFilterModal) {
                filterContext.setFilterFieldLists((prevLists) => ({
                    ...prevLists,
                    [dataIndex]: value,
                }));
            } else {
                dataContext.setDataFieldLists((prevLists) => ({
                    ...prevLists,
                    [dataIndex]: value,
                }));
            }
        }
    };
    const setValueByDataIndex = (dataIndex: string | undefined, value: any) => {
        if (dataIndex) {
            if (isFilterModal) {
                filterContext.setModalFilterValues((prevDatas) => {
                    const computedData = { ...prevDatas };
                    if (value === null) {
                        delete computedData[dataIndex];
                        return computedData;
                    }
                    return {
                        ...computedData,
                        [dataIndex]: value,
                    };
                });
            } else {
                dataContext.setModalData((prevDatas) => {
                    const computedData = { ...prevDatas };
                    if (value === null) {
                        delete computedData[dataIndex];
                        return computedData;
                    }
                    return {
                        ...computedData,
                        [dataIndex]: value,
                    };
                });
                dataContext.setDataFieldErrors((prevErrors) => {
                    const computedErrors = { ...prevErrors };
                    delete computedErrors[dataIndex];
                    return computedErrors;
                });
            }
        }
    };
    const setControllerByDataIndex = (dataIndex: string | undefined, controller: CancelTokenSource) => {
        if (dataIndex) {
            if (isFilterModal) {
                filterContext.setFilterFieldControllers((prevControllers) => ({
                    ...prevControllers,
                    [dataIndex]: controller,
                }));
            } else {
                dataContext.setDataFieldControllers((prevControllers) => ({
                    ...prevControllers,
                    [dataIndex]: controller,
                }));
            }
        }
    };
    const setModalDataValue = (value: GeneralObject) => {
        dataContext.setModalData(() => value);
    };
    const setModalFilterValue = (value: GeneralObject) => {
        filterContext.setModalFilterValues(() => value);
    };

    const setFilterValue = (value: GeneralObject) => {
        filterContext.setFilterValues(() => value);
    };

    const modalConfigRef = useRef(configContext.modalConfig);
    const filterConfigRef = useRef(configContext.filterConfig);
    const dataFieldControllersRef = useRef(dataContext.dataFieldControllers);
    const filterFieldControllersRef = useRef(filterContext.filterFieldControllers);

    useEffect(() => {
        modalConfigRef.current = configContext.modalConfig;
    }, [configContext.modalConfig]);

    useEffect(() => {
        filterConfigRef.current = configContext.filterConfig;
    }, [configContext.filterConfig]);

    useEffect(() => {
        dataFieldControllersRef.current = dataContext.dataFieldControllers;
    }, [dataContext.dataFieldControllers]);

    useEffect(() => {
        filterFieldControllersRef.current = filterContext.filterFieldControllers;
    }, [filterContext.filterFieldControllers]);

    const resetFieldsByGlobalDepend = (globalDepend?: string) => {
        const isSelectable = (fieldType: TableFieldTypes | undefined) => {
            if (!fieldType) return false;
            switch (fieldType) {
                case Z_TableFieldTypes.enum.SELECT:
                case Z_TableFieldTypes.enum.MULTISELECT:
                case Z_TableFieldTypes.enum.CONDITION:
                    return true;
                default:
                    return false;
            }
        };
        modalConfigRef.current.forEach((modalField) => {
            if (isSelectable(modalField.field?.type) && (!globalDepend || modalField.globalDependField === globalDepend)) {
                if (modalField.field?.dataIndex_write) {
                    const tempDataIndex = modalField.field?.dataIndex_write;
                    dataFieldControllersRef.current[tempDataIndex]?.cancel();
                    dataContext.setDataFieldLists((prevLists) => {
                        const computedLists = { ...prevLists };
                        delete computedLists[tempDataIndex];
                        return computedLists;
                    });
                }
            }
        });
        filterConfigRef.current.forEach((filterField) => {
            if (
                isSelectable(filterField.filterField?.type) &&
                (!globalDepend || filterField.globalDependField === globalDepend)
            ) {
                if (filterField.filterField?.dataIndex_write) {
                    const tempDataIndex = filterField.filterField.dataIndex_write;
                    filterFieldControllersRef.current[tempDataIndex]?.cancel();
                    filterContext.setFilterFieldLists((prevLists) => {
                        const computedLists = { ...prevLists };
                        delete computedLists[tempDataIndex];
                        return computedLists;
                    });
                }
            }
        });
    };

    useEffect(() => {
        if (isModalOpen) {
            if (isAddModal) {
                configContext.modalConfig.forEach((targetColumn) => {
                    if (targetColumn[config]?.type === Z_TableFieldTypes.enum.BOOLEAN) {
                        setValueByDataIndex(targetColumn[config]?.dataIndex_write, targetColumn[config]?.initValue);
                    }
                });
            } else if (modalType === Z_ModalTypes.enum.ADD_BASED || modalType === Z_ModalTypes.enum.UPDATE) {
                const dependColumns = configContext[modalConfig].filter(
                    (targetColumn) =>
                        targetColumn[config]?.dependType === Z_DependencyTypes.enum.FULL &&
                        (targetColumn[config]?.type === Z_TableFieldTypes.enum.SELECT ||
                            targetColumn[config]?.type === Z_TableFieldTypes.enum.MULTISELECT)
                );

                dependColumns.forEach((dependColumn) => {
                    const params: GeneralObject = {};
                    const tempDataIndex = dependColumn[config]?.dataIndex_write;
                    if (dependColumn.dependField && tempDataIndex) {
                        if (typeof dependColumn.dependField === "string") {
                            params[dependColumn.dependField] = VALUES[dependColumn.dependField];
                        } else {
                            for (const dependField of dependColumn.dependField) {
                                params[dependField] = VALUES[dependField];
                            }
                        }

                        if (dependColumn.globalDependField && propsContext.globalDependencies) {
                            params[dependColumn.globalDependField] =
                                propsContext.globalDependencies[dependColumn.globalDependField] || null;
                        }

                        setLoadingByDataIndex(tempDataIndex, true);

                        const source = axios.CancelToken.source();
                        dataContext.dataFieldControllers[tempDataIndex]?.cancel();
                        requester
                            .get(dependColumn.fieldGetApi, {
                                params,
                                cancelToken: source.token,
                            })
                            .then((response) => {
                                setListByDataIndex(tempDataIndex, response.data || []);
                            })
                            .finally(() => {
                                setLoadingByDataIndex(tempDataIndex, false);
                            });
                        setControllerByDataIndex(tempDataIndex, source);
                    }
                });
            }
            configContext[modalConfig]
                .filter(
                    (targetColumn) =>
                        (targetColumn[config]?.type === Z_TableFieldTypes.enum.SELECT ||
                            targetColumn[config]?.type === Z_TableFieldTypes.enum.MULTISELECT ||
                            targetColumn[config]?.type === Z_TableFieldTypes.enum.CONDITION) &&
                        targetColumn.fieldGetApi &&
                        (targetColumn.dependField === undefined ||
                            !targetColumn.onDependChange ||
                            targetColumn[config]?.dependType !== Z_DependencyTypes.enum.FULL)
                )
                .forEach((selectField) => {
                    const params: GeneralObject = {};
                    const tempDataIndex = selectField[config]?.dataIndex_write;
                    if (tempDataIndex && LISTS[tempDataIndex] === undefined && !LOADINGS[tempDataIndex]) {
                        if (selectField.globalDependField && propsContext.globalDependencies) {
                            params[selectField.globalDependField] =
                                propsContext.globalDependencies[selectField.globalDependField] || null;
                        }
                        setLoadingByDataIndex(tempDataIndex, true);
                        const source = axios.CancelToken.source();
                        CONTROLLERS[tempDataIndex]?.cancel();
                        requester
                            .get(selectField.fieldGetApi, { params, cancelToken: source.token })
                            .then((response) => {
                                setListByDataIndex(tempDataIndex, response.data || []);
                            })
                            .finally(() => {
                                setLoadingByDataIndex(tempDataIndex, false);
                            });
                        setControllerByDataIndex(tempDataIndex, source);
                    }
                });
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (propsContext.globalDependencies) {
            Object.keys(propsContext.globalDependencies).forEach((globalDependency) => {
                const value = propsContext.globalDependencies?.[globalDependency];
                if (value !== undefined) {
                    resetFieldsByGlobalDepend(globalDependency);
                }
            });
        }
    }, [propsContext.globalDependencies]);

    useEffect(() => {
        return () => {
            resetFieldsByGlobalDepend();
        };
    }, []);

    if (!isDataModal && !isFilterModal) return null;
    return (
        <FieldModalContext.Provider
            value={{
                isModalOpen,

                isAddModal,
                isAddBasedModal,
                isUpdateModal,
                isDataModal,
                isFilterModal,

                hasCreateApi,
                hasUpdateApi,

                modalLoading,

                modalConfig,
                config,

                actions: {
                    cleanLoadings,
                    setLoadingByDataIndex,

                    cleanLists,
                    setListByDataIndex,

                    setValueByDataIndex,

                    setControllerByDataIndex,

                    setModalDataValue,
                    setModalFilterValue,
                    setFilterValue,

                    resetFieldsByGlobalDepend,
                },

                LOADINGS,
                LISTS,
                VALUES,
                CONTROLLERS,
            }}
        >
            <Modal {...modalProps}>
                <Aligner isVertical gutter={8}>
                    {[...Array(Math.ceil(configContext[modalConfig].length / 2))]
                        .map((_, index) => index * 2)
                        .filter((index) => index < configContext[modalConfig].length)
                        .map((i) => (
                            <Row gutter={12} align="top" key={i} style={{ width: "100%" }}>
                                <FieldItem field={configContext[modalConfig][i]} {...{ showDataChangedIcon }} />
                                {i + 1 < configContext[modalConfig].length && (
                                    <FieldItem field={configContext[modalConfig][i + 1]} {...{ showDataChangedIcon }} />
                                )}
                            </Row>
                        ))}
                </Aligner>
            </Modal>
        </FieldModalContext.Provider>
    );
};

export default FieldModal;
