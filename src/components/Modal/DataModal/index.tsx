import AddBoxIcon from "@mui/icons-material/AddBox";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import EditIcon from "@mui/icons-material/Edit";
import { Col, Input, message, Row, Select, Switch } from "antd";
import { useContext, useEffect, useState } from "react";
import Modal, { ModalType } from "..";
import { ErrorText } from "../../../constants/UI";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import DataFetchContext from "../../../context/DataFetchContext";
import FilterContext from "../../../context/FilterContext";
import UIContext from "../../../context/UIContext";
import { requester } from "../../../controllers/controllers";
import { filterOption, getOptionTitle, getOptionValue } from "../../../functions/global";
import {
    DependencyActionType,
    ModalTypes,
    Z_DependencyActions,
    Z_DependencyTypes,
    Z_ModalTypes,
    Z_TableFieldTypes,
} from "../../../types/enums";
import { ColumnType, GeneralObject } from "../../../types/general";
import Aligner from "../../Aligner";
import Tooltip from "../../Tooltip";

interface DataModalType {
    modalType: ModalTypes;
    open: boolean;
    setOpen: (state: boolean) => void;
}

const DataField = ({ field, disabled }: { field: ColumnType; disabled: boolean }) => {
    const dataContext = useContext(DataContext);
    const configContext = useContext(ConfigContext);
    const hasAPI = !!field.fieldGetApi;
    const dataIndex = field.field?.dataIndex_write || "";

    const options = dataContext.dataFieldLists[dataIndex] || [];
    const loadingField = dataContext.dataFieldLoadings[dataIndex];

    const setLoading = (dataIndex: string | undefined, value: boolean) => {
        if (dataIndex) {
            dataContext.setDataFieldLoadings((prevLoadings) => ({
                ...prevLoadings,
                [dataIndex]: value,
            }));
        }
    };

    const setList = (dataIndex: string | undefined, value: any[]) => {
        if (dataIndex) {
            dataContext.setDataFieldLists((prevLists) => ({
                ...prevLists,
                [dataIndex]: value,
            }));
        }
    };

    const setData = (dataIndex: string | undefined, value: any) => {
        if (dataIndex) {
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
    };

    const updateDependencies = (targetDataIndex: string | undefined, newValue: any, isDirectDepends = false) => {
        if (!targetDataIndex) return;
        const depends = configContext.modalConfig.filter(
            (modalField) =>
                modalField.dependField &&
                (typeof modalField.dependField === "string"
                    ? modalField.dependField === targetDataIndex
                    : modalField.dependField.includes(targetDataIndex)) &&
                modalField.onDependChange === Z_DependencyActions.enum.FETCH
        );
        depends.forEach((dependField) => {
            if (dependField.field?.dataIndex_write) {
                if (typeof dependField.dependField === "string") {
                    setList(dependField.field.dataIndex_write, []);
                    setData(dependField.field.dataIndex_write, null);
                    updateDependencies(dependField.field.dataIndex_write, null);
                    if (isDirectDepends) {
                        setLoading(dependField.field.dataIndex_write, true);

                        const computedParam = dependField.paramOnDepend
                            ? typeof dependField.paramOnDepend === "string"
                                ? dependField.paramOnDepend
                                : dependField.paramOnDepend[0]
                            : dependField.field.dataIndex_write;

                        requester
                            .get(dependField.fieldGetApi, { params: { [computedParam]: newValue } })
                            .then((response) => {
                                setList(dependField.field?.dataIndex_write, response.data || []);
                            })
                            .finally(() => {
                                setLoading(dependField.field?.dataIndex_write, false);
                            });
                    }
                } else {
                    const dependParams: GeneralObject = {};
                    for (let i = 0; i < dependField.dependField.length; i++) {
                        dependParams[
                            dependField.paramOnDepend && Array.isArray(dependField.paramOnDepend)
                                ? dependField.paramOnDepend[i] || dependField.dependField[i]
                                : dependField.dependField[i]
                        ] =
                            dependField.dependField[i] === targetDataIndex
                                ? newValue
                                : dataContext.modalData[dependField.dependField[i]];
                    }

                    if (Object.values(dependParams).every((dependValue) => dependValue !== undefined)) {
                        setList(dependField.field.dataIndex_write, []);
                        setData(dependField.field.dataIndex_write, null);
                        updateDependencies(dependField.field.dataIndex_write, null);
                        if (isDirectDepends) {
                            setLoading(dependField.field.dataIndex_write, true);
                            requester
                                .get(dependField.fieldGetApi, { params: dependParams })
                                .then((response) => {
                                    setList(dependField.field?.dataIndex_write, response.data || []);
                                })
                                .finally(() => {
                                    setLoading(dependField.field?.dataIndex_write, false);
                                });
                        }
                    }
                }
            }
        });
    };

    const isSelect = field.field?.type === Z_TableFieldTypes.enum.SELECT;
    const isMultiselect = field.field?.type === Z_TableFieldTypes.enum.MULTISELECT;
    const isBoolean = field.field?.type === Z_TableFieldTypes.enum.BOOLEAN;

    const handleChange = (event: any) => {
        const initValue = field.field?.initValue || null;

        if (isSelect) {
            const computedValue = event || initValue;
            setData(dataIndex, computedValue);
            updateDependencies(field.field?.dataIndex_write, computedValue, true);
        } else if (isMultiselect) {
            const result = Array.isArray(event) ? event : [];
            setData(dataIndex, (result || []).join(",") || initValue);
        } else if (isBoolean) {
            setData(
                dataIndex,
                field.field?.booleanDataIndex ? field.field?.booleanDataIndex[!!event ? "onTrue" : "onFalse"] : !!event
            );
        } else {
            setData(dataIndex, event?.target?.value || initValue);
        }
    };

    const currentValue = dataContext.modalData[dataIndex];

    const defaultValue = currentValue || field.field?.initValue || (isMultiselect ? [] : null);

    const isDepends = field.dependField !== undefined && !!field.field?.dependType;

    const value = isMultiselect
        ? Array.isArray(currentValue)
            ? currentValue
            : typeof currentValue === "string"
            ? currentValue.split(",")
            : defaultValue
        : isBoolean
        ? field.field?.booleanDataIndex
            ? currentValue
                ? field.field?.booleanDataIndex.onFalse === currentValue
                    ? false
                    : true
                : field.field?.booleanDataIndex.onTrue === field.field.initValue
                ? true
                : false
            : currentValue
        : defaultValue;

    const commonProps = {
        id: dataIndex,
        onChange: handleChange,
        disabled: disabled,
    };

    const commonFieldProps = {
        ...commonProps,
        value: dataContext.dataFieldLoadings[dataIndex] ? null : value,
        placeholder: "Введите",
        style: { width: "100%" },
    };

    const getPlaceholder = () => {
        const LOADING = "Загрузка...";
        const SELECT = "Выберите";
        const NOT_SELECTED = "Не выбрано:";

        const getDependTitle = (dependDataIndex: string) =>
            configContext.modalConfig.find((modalField) => modalField.field?.dataIndex_write === dependDataIndex)?.field
                ?.title;

        if (loadingField) return LOADING;
        else if (!isDepends) return SELECT;
        else if (field.dependField === undefined) return SELECT;
        else if (typeof field.dependField === "string") {
            if (dataContext.modalData[field.dependField] !== undefined) return SELECT;
            else return `${NOT_SELECTED} ${getDependTitle(field.dependField)}`;
        }
        if (field.dependField.some((dependField) => dataContext.modalData[dependField] === undefined)) {
            return `${NOT_SELECTED} ${field.dependField
                .filter((dependField) => dataContext.modalData[dependField] === undefined)
                .map((dependField) => getDependTitle(dependField))
                .join(", ")}`;
        }
        return SELECT;
    };

    const commonSelectProps = {
        ...commonFieldProps,
        showArrow: true,
        showSearch: true,
        placeholder: getPlaceholder(),
        disabled: !hasAPI || disabled,
        loading: loadingField,
        filterOption: filterOption,
    };

    const computedOptions = [...options].map((option) => (
        <Select.Option
            key={getOptionValue(field, option)}
            value={getOptionValue(field, option)}
            style={{ width: "calc(100% - 16px)" }}
        >
            {getOptionTitle(field, option)}
        </Select.Option>
    ));

    const fieldType: { [key: string]: JSX.Element } = {
        [Z_TableFieldTypes.enum.TEXT]: <Input {...commonFieldProps} type={"text"} />,
        [Z_TableFieldTypes.enum.NUMBER]: <Input {...commonFieldProps} type={"number"} />,
        [Z_TableFieldTypes.enum.DATE]: <Input {...commonFieldProps} type={"date"} />,
        [Z_TableFieldTypes.enum.BOOLEAN]: <Switch {...commonProps} checked={value} />,
        [Z_TableFieldTypes.enum.SELECT]: <Select {...commonSelectProps}>{computedOptions}</Select>,
        [Z_TableFieldTypes.enum.MULTISELECT]: (
            <Select {...commonSelectProps} mode="multiple">
                {computedOptions}
            </Select>
        ),
    };
    if (field.field?.type === Z_TableFieldTypes.enum.NONE) return null;
    if (
        field.dependField &&
        typeof field.dependField === "string" &&
        !Array.isArray(field.onDependChange) &&
        typeof field.onDependChange === "object"
    ) {
        const isTrue = field.onDependChange?.value === dataContext.modalData[field.dependField];
        let operations: DependencyActionType[] = [];
        if (isTrue && field.onDependChange?.onTrue) {
            operations = operations.concat(field.onDependChange?.onTrue);
        } else if (!isTrue && field.onDependChange?.onFalse) {
            operations = operations.concat(field.onDependChange?.onFalse);
        }
        for (let i = 0; i < operations.length; i++) {
            if (operations[i] === Z_DependencyActions.enum.FETCH) {
                setLoading(field.field?.dataIndex_write, true);
                setList(field.field?.dataIndex_write, []);
                setData(field.field?.dataIndex_write, null);
                requester
                    .get(field.fieldGetApi)
                    .then((response) => {
                        setList(field.field?.dataIndex_write, response.data || []);
                    })
                    .finally(() => {
                        setLoading(field.field?.dataIndex_write, false);
                    });
            } else if (operations[i] === Z_DependencyActions.enum.RESET) {
                setData(field.field?.dataIndex_write, field.field?.initValue || null);
            }
        }
    }
    return fieldType[field.field?.type as string];
};

const FieldItem = ({
    field,
    disabled = false,
    showDataChangedIcon = false,
}: {
    field: ColumnType;
    disabled?: boolean;
    showDataChangedIcon?: boolean;
}) => {
    const dataContext = useContext(DataContext);
    if (
        field.dependField &&
        typeof field.dependField === "string" &&
        !Array.isArray(field.onDependChange) &&
        typeof field.onDependChange === "object"
    ) {
        const isTrue = field.onDependChange?.value === dataContext.modalData[field.dependField];
        let operations: DependencyActionType[] = [];
        if (isTrue && field.onDependChange?.onTrue) {
            operations = operations.concat(field.onDependChange?.onTrue);
        } else if (!isTrue && field.onDependChange?.onFalse) {
            operations = operations.concat(field.onDependChange?.onFalse);
        }
        if (operations.includes(Z_DependencyActions.enum.HIDE)) {
            return null;
        }
    }

    if (!field.field?.dataIndex_write) return null;
    return (
        <Col span={12}>
            <Aligner style={{ justifyContent: "stretch" }} isVertical gutter={2}>
                <Aligner style={{ justifyContent: "flex-start", alignItems: "center", width: "100%", gap: "0 8px" }}>
                    {field.field?.title}
                    {!field.isRequired && <span style={{ color: "#aaa" }}>(Необяз.)</span>}
                    {showDataChangedIcon &&
                        dataContext.dataOldValues[field.field.dataIndex_write] !==
                            dataContext.modalData[field.field.dataIndex_write] && (
                            <Tooltip title="Значение было изменено">
                                <Aligner style={{ color: "#aaa" }}>
                                    <AnnouncementIcon sx={{ fontSize: "16px" }} />
                                </Aligner>
                            </Tooltip>
                        )}
                </Aligner>
                <div style={{ width: "100%", position: "relative" }}>
                    <DataField field={field} disabled={disabled} />
                </div>
                {dataContext.dataFieldErrors[field.field.dataIndex_write] !== undefined && (
                    <ErrorText text={dataContext.dataFieldErrors[field.field.dataIndex_write]} />
                )}
            </Aligner>
        </Col>
    );
};

const DataModal = ({ modalType, open, setOpen }: DataModalType) => {
    const dataFetchContext = useContext(DataFetchContext);
    const filterContext = useContext(FilterContext);
    const configContext = useContext(ConfigContext);
    const dataContext = useContext(DataContext);
    const UI = useContext(UIContext);

    const [requestLoading, setRequiestLoading] = useState(false);

    const isAddModal = modalType === Z_ModalTypes.enum.ADD || modalType === Z_ModalTypes.enum.ADD_BASED;
    const isEditModal = modalType === Z_ModalTypes.enum.EDIT;

    const showDataChangedIcon = modalType === Z_ModalTypes.enum.ADD_BASED || isEditModal;

    const setLoading = (dataIndex: string | undefined, value: boolean) => {
        if (dataIndex) {
            dataContext.setDataFieldLoadings((prevLoadings) => ({
                ...prevLoadings,
                [dataIndex]: value,
            }));
        }
    };

    const setList = (dataIndex: string | undefined, value: any[]) => {
        if (dataIndex) {
            dataContext.setDataFieldLists((prevLoadings) => ({
                ...prevLoadings,
                [dataIndex]: value,
            }));
        }
    };

    const setDataByDataIndex = (dataIndex: string | undefined, value: any) => {
        if (dataIndex) {
            dataContext.setModalData((prevLoadings) => ({
                ...prevLoadings,
                [dataIndex]: value,
            }));
        }
    };

    const setData = (value: GeneralObject) => {
        dataContext.setModalData(() => value);
    };

    const closeModal = () => {
        setOpen(false);
        configContext.modalConfig.forEach((modalField) => {
            if (modalField.field?.dependType === Z_DependencyTypes.enum.FULL) {
                setLoading(modalField.field?.dataIndex_write, false);
                setList(modalField.field?.dataIndex_write, []);
                setDataByDataIndex(modalField.field?.dataIndex_write, null);
            }
        });
        dataContext.setDataFieldErrors({});
    };

    const handleCancelData = () => {
        setData({});
        closeModal();
    };

    const handleConfirmData = () => {
        if (isAddModal && configContext.defaultTableConfig?.dataCreateApi) {
            setRequiestLoading(true);
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
                    setRequiestLoading(false);
                });
        } else if (isEditModal && configContext.defaultTableConfig?.dataUpdateApi) {
            setRequiestLoading(true);
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
                    setRequiestLoading(false);
                });
        }
    };

    const getModalTitle = () => {
        switch (modalType) {
            case Z_ModalTypes.enum.ADD:
            case Z_ModalTypes.enum.ADD_BASED:
                return "Добавление";
            case Z_ModalTypes.enum.EDIT:
                return "Изменение";
        }
    };

    useEffect(() => {
        if (open) {
            if (modalType === Z_ModalTypes.enum.ADD) {
                configContext.modalConfig.forEach((field) => {
                    if (field.field?.type === Z_TableFieldTypes.enum.BOOLEAN) {
                        setDataByDataIndex(field.field?.dataIndex_write, field.field.initValue);
                    }
                });
            } else if (modalType === Z_ModalTypes.enum.ADD_BASED || modalType === Z_ModalTypes.enum.EDIT) {
                const depends = configContext.modalConfig.filter(
                    (targetField) =>
                        targetField.field?.dependType === Z_DependencyTypes.enum.FULL &&
                        (targetField.field?.type === Z_TableFieldTypes.enum.SELECT ||
                            targetField.field?.type === Z_TableFieldTypes.enum.MULTISELECT)
                );

                depends.forEach((depend) => {
                    const params: GeneralObject = {};
                    if (depend.dependField) {
                        if (typeof depend.dependField === "string") {
                            params[depend.dependField] = dataContext.modalData[depend.dependField];
                        } else {
                            for (const dependField of depend.dependField) {
                                params[dependField] = dataContext.modalData[dependField];
                            }
                        }
                        setLoading(depend.field?.dataIndex_write, true);
                        requester
                            .get(depend.fieldGetApi, {
                                params,
                            })
                            .then((response) => {
                                setList(depend.field?.dataIndex_write, response.data || []);
                            })
                            .finally(() => {
                                setLoading(depend.field?.dataIndex_write, false);
                            });
                    }
                });
            }
            configContext.modalConfig
                .filter(
                    (field) =>
                        (field.field?.type === Z_TableFieldTypes.enum.SELECT ||
                            field.field?.type === Z_TableFieldTypes.enum.MULTISELECT) &&
                        field.fieldGetApi &&
                        (field.dependField === undefined ||
                            !field.onDependChange ||
                            field.field.dependType !== Z_DependencyTypes.enum.FULL)
                )
                .forEach((field) => {
                    const dataIndex = field.field?.dataIndex_write;
                    if (
                        dataIndex &&
                        dataContext.dataFieldLists[dataIndex] === undefined &&
                        !dataContext.dataFieldLoadings[dataIndex]
                    ) {
                        setLoading(dataIndex, true);
                        requester
                            .get(field.fieldGetApi)
                            .then((response) => {
                                setList(dataIndex, response.data || []);
                            })
                            .finally(() => {
                                setLoading(dataIndex, false);
                            });
                    }
                });
        }
    }, [open]);

    const noCreateApi = !configContext.defaultTableConfig?.dataCreateApi;
    const noEditApi = !configContext.defaultTableConfig?.dataUpdateApi;

    const getErrorText = () => {
        if (isAddModal && noCreateApi) return <ErrorText text={"Отсутствует API для создания!"} />;
        else if (isEditModal && noEditApi) return <ErrorText text={"Отсутствует API для изменения!"} />;
        else if (dataContext.dataFieldErrors.error !== undefined)
            return <ErrorText text={dataContext.dataFieldErrors.error} />;
        return undefined;
    };

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                {modalType === Z_ModalTypes.enum.EDIT ? (
                    <EditIcon sx={{ fontSize: 24 }} />
                ) : (
                    <AddBoxIcon sx={{ fontSize: 24 }} />
                )}
                {getModalTitle()}
            </Aligner>
        ),
        open: open,
        onConfirm: handleConfirmData,
        onCancel: handleCancelData,
        type: modalType,
        width: 700,
        closable: !requestLoading,
        leftFooter: getErrorText(),
        rightFooter: (
            <>
                <UI.SecondaryBtn onClick={handleCancelData} loading={requestLoading}>
                    Отмена
                </UI.SecondaryBtn>
                <UI.PrimaryBtn
                    onClick={handleConfirmData}
                    loading={requestLoading}
                    disabled={isAddModal ? noCreateApi : isEditModal ? noEditApi : false}
                >
                    {isAddModal ? "Добавить" : isEditModal ? "Изменить" : "Сохранить"}
                </UI.PrimaryBtn>
            </>
        ),
    };

    return (
        <Modal {...modalProps}>
            <Aligner isVertical gutter={8}>
                {[...Array(Math.ceil(configContext.modalConfig.length / 2))]
                    .map((_, index) => index * 2)
                    .filter((index) => index < configContext.modalConfig.length)
                    .map((i) => (
                        <Row gutter={12} align={"top"} key={i} style={{ width: "100%" }}>
                            <FieldItem
                                field={configContext.modalConfig[i]}
                                disabled={requestLoading}
                                showDataChangedIcon={showDataChangedIcon}
                            />
                            {i + 1 < configContext.modalConfig.length && (
                                <FieldItem
                                    field={configContext.modalConfig[i + 1]}
                                    disabled={requestLoading}
                                    showDataChangedIcon={showDataChangedIcon}
                                />
                            )}
                        </Row>
                    ))}
            </Aligner>
        </Modal>
    );
};

export default DataModal;
