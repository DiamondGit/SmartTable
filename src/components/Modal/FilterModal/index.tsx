import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Col, Input, Row, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useContext, useEffect } from "react";
import Modal, { ModalType } from "..";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import DataFetchContext from "../../../context/DataFetchContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import UIContext from "../../../context/UIContext";
import { requester } from "../../../controllers/controllers";
import { filterOption, getOptionTitle, getOptionValue } from "../../../functions/global";
import { Z_ModalTypes, Z_TableFieldTypes } from "../../../types/enums";
import { ColumnType, GeneralObject } from "../../../types/general";
import Aligner from "../../Aligner";
import style from "./FilterModal.module.scss";

interface FilterModalType {
    open: boolean;
    setOpen: (state: boolean) => void;
}

const FilterField = ({ field }: { field: ColumnType }) => {
    const filterContext = useContext(FilterContext);
    const hasAPI = !!field.fieldGetApi;
    const dataIndex = field.filterField?.dataIndex_write || "";

    const options = filterContext.filterFieldLists[dataIndex] || [];
    const loadingField = filterContext.filterFieldLoadings[dataIndex];

    const setModalValue = (dataIndex: string | undefined, value: boolean) => {
        if (dataIndex) {
            filterContext.setModalFilterValues((prevValues) => ({
                ...prevValues,
                [dataIndex]: value,
            }));
        }
    };

    const handleChange =
        (certainDataIndex = "") =>
        (event: any) => {
            const computedDataIndex = certainDataIndex || dataIndex;

            const initValue = field.filterField?.initValue || null;

            const isSelect = field.filterField?.type === Z_TableFieldTypes.enum.SELECT;
            const isMultiselect = field.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT;
            const isCondition = field.filterField?.type === Z_TableFieldTypes.enum.CONDITION;

            if (isSelect) {
                setModalValue(computedDataIndex, event || initValue);
            } else if (isMultiselect) {
                const result = Array.isArray(event) ? event : [];
                setModalValue(computedDataIndex, (result || []).join(",") || initValue);
            } else if (isCondition) {
                setModalValue(computedDataIndex, (certainDataIndex ? event?.target?.value : event) || initValue);
                if (!certainDataIndex && !event) {
                    setModalValue(field.filterField?.conditionalDataIndex?.from, initValue);
                    setModalValue(field.filterField?.conditionalDataIndex?.to, initValue);
                }
            } else {
                setModalValue(computedDataIndex, event?.target?.value || initValue);
            }
        };

    const currentValue = filterContext.modalFilterValues[dataIndex];
    const isMultiselect = field.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT;
    const isCondition = field.filterField?.type === Z_TableFieldTypes.enum.CONDITION;

    const defaultValue = currentValue || field.filterField?.initValue || (isMultiselect ? [] : null);

    const value = isMultiselect
        ? Array.isArray(currentValue)
            ? currentValue
            : typeof currentValue === "string"
            ? currentValue.split(",")
            : defaultValue
        : isCondition
        ? typeof currentValue === "object"
            ? currentValue
            : defaultValue
        : defaultValue;

    const commonProps = {
        id: dataIndex,
        value: value,
        onChange: handleChange(),
        allowClear: true,
        placeholder: "Введите",
        style: { width: "100%" },
    };

    const commonSelectProps = {
        ...commonProps,
        showArrow: true,
        showSearch: true,
        placeholder: loadingField ? "Загрузка..." : "Выберите",
        disabled: !hasAPI,
        loading: loadingField,
        filterOption: filterOption,
    };

    const commonConditionProps = {
        placeholder: undefined,
        allowClear: false,
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

    const isConditionBetween = value === "между";
    const hasValue = value !== field.filterField?.initValue;

    const fieldType: { [key: string]: JSX.Element } = {
        [Z_TableFieldTypes.enum.TEXT]: <Input {...commonProps} type={"text"} />,
        [Z_TableFieldTypes.enum.NUMBER]: <Input {...commonProps} type={"number"} />,
        [Z_TableFieldTypes.enum.DATE]: <Input type={"date"} value={value} />,
        [Z_TableFieldTypes.enum.CONDITION]: (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: !hasValue ? "1fr" : isConditionBetween ? "3fr 2fr auto 2fr" : "2fr 1fr",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <Select {...commonSelectProps}>{computedOptions}</Select>
                {hasValue && (
                    <>
                        <Input
                            {...commonProps}
                            {...commonConditionProps}
                            value={filterContext.modalFilterValues?.[field.filterField?.conditionalDataIndex?.from || ""]}
                            onChange={handleChange(field.filterField?.conditionalDataIndex?.from)}
                            type={"number"}
                        />
                        {isConditionBetween && (
                            <>
                                и
                                <Input
                                    {...commonProps}
                                    {...commonConditionProps}
                                    value={
                                        filterContext.modalFilterValues?.[field.filterField?.conditionalDataIndex?.to || ""]
                                    }
                                    onChange={handleChange(field.filterField?.conditionalDataIndex?.to)}
                                    type={"number"}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        ),
        [Z_TableFieldTypes.enum.SELECT]: <Select {...commonSelectProps}>{computedOptions}</Select>,
        [Z_TableFieldTypes.enum.MULTISELECT]: (
            <Select {...commonSelectProps} mode="multiple">
                {computedOptions}
            </Select>
        ),
    };
    if (field.filterField?.type === Z_TableFieldTypes.enum.NONE) return null;
    return fieldType[field.filterField?.type as string];
};

const FilterItem = ({ field }: { field: ColumnType }) => {
    return (
        <Col span={12}>
            <Aligner style={{ justifyContent: "stretch" }} isVertical gutter={2}>
                <span style={{ width: "100%", textAlign: "left" }}>{field.filterField?.title}</span>
                <div style={{ width: "100%", position: "relative" }}>
                    <FilterField field={field} />
                </div>
            </Aligner>
        </Col>
    );
};

const FilterModal = ({ open, setOpen }: FilterModalType) => {
    const propsContext = useContext(PropsContext);
    const filterContext = useContext(FilterContext);
    const configContext = useContext(ConfigContext);
    const dataFetchContext = useContext(DataFetchContext);
    const UI = useContext(UIContext);

    const setModalValue = (value: GeneralObject) => {
        filterContext.setModalFilterValues(() => value);
    };

    const setValue = (value: GeneralObject) => {
        filterContext.setFilterValues(() => value);
    };

    const setLoading = (dataIndex: string | undefined, value: boolean) => {
        if (dataIndex) {
            filterContext.setFilterFieldLoadings((prevLoadings) => ({
                ...prevLoadings,
                [dataIndex]: value,
            }));
        }
    };

    const setList = (dataIndex: string | undefined, value: any[]) => {
        if (dataIndex) {
            filterContext.setFilterFieldLists((prevLists) => ({
                ...prevLists,
                [dataIndex]: value,
            }));
        }
    };

    const closeModal = () => {
        setOpen(false);
    };

    const handleCancelFilter = () => {
        setModalValue(filterContext.filterValues);
        closeModal();
    };

    const handleConfirmFilter = () => {
        const computedFilterValues: GeneralObject = {};
        Object.keys(filterContext.modalFilterValues).forEach((filterField) => {
            if (
                filterContext.modalFilterValues[filterField] !==
                configContext.filterConfig.find((field) => field.filterField?.dataIndex_write === filterField)?.filterField
                    ?.initValue
            ) {
                computedFilterValues[filterField] = filterContext.modalFilterValues[filterField];
            }
        });

        dataFetchContext.getData?.({
            ...filterContext.queryProps,
            filters: computedFilterValues,
        });

        setValue(computedFilterValues);
        closeModal();
    };

    const resetFilters = () => {
        setModalValue({});
    };

    useEffect(() => {
        if (open) {
            configContext.filterConfig
                .filter(
                    (filterField) =>
                        (filterField.filterField?.type === Z_TableFieldTypes.enum.SELECT ||
                            filterField.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT ||
                            filterField.filterField?.type === Z_TableFieldTypes.enum.CONDITION) &&
                        filterField.fieldGetApi
                )
                .forEach((filterField) => {
                    const dataIndex = filterField.filterField?.dataIndex_write;
                    if (
                        dataIndex &&
                        filterContext.filterFieldLists[dataIndex] === undefined &&
                        !filterContext.filterFieldLoadings[dataIndex]
                    ) {
                        setLoading(dataIndex, true);
                        requester
                            .get(filterField.fieldGetApi)
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

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <FilterAltIcon sx={{ fontSize: 24 }} />
                {`Фильтр таблицы "${propsContext.tableTitle}"`.trim()}
            </Aligner>
        ),
        open: open,
        onConfirm: handleConfirmFilter,
        onCancel: handleCancelFilter,
        type: Z_ModalTypes.enum.FILTER,
        width: 700,
        leftFooter: JSON.stringify(filterContext.modalFilterValues) !== "{}" && (
            <UI.SecondaryBtn onClick={resetFilters}>Сбросить</UI.SecondaryBtn>
        ),
        rightFooter: (
            <>
                <UI.SecondaryBtn onClick={handleCancelFilter}>Отмена</UI.SecondaryBtn>
                <UI.PrimaryBtn onClick={handleConfirmFilter}>Применить</UI.PrimaryBtn>
            </>
        ),
    };

    return (
        <Modal {...modalProps}>
            <div className={style.filterContainer}>
                <Aligner isVertical gutter={8}>
                    {[...Array(Math.ceil(configContext.filterConfig.length / 2))]
                        .map((_, index) => index * 2)
                        .filter((index) => index < configContext.filterConfig.length)
                        .map((i) => (
                            <Row gutter={12} align={"top"} key={i} style={{ width: "100%" }}>
                                <FilterItem field={configContext.filterConfig[i]} />
                                {i + 1 < configContext.filterConfig.length && (
                                    <FilterItem field={configContext.filterConfig[i + 1]} />
                                )}
                            </Row>
                        ))}
                </Aligner>
            </div>
        </Modal>
    );
};

export default FilterModal;
