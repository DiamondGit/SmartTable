import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Col, Input, Row, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useContext, useEffect } from "react";
import Modal, { ModalType } from "..";
import { FLAG } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import UIContext from "../../../context/UIContext";
import { requester } from "../../../controllers/controllers";
import { Z_DependencyTypes, Z_ModalTypes, Z_TableFieldTypes } from "../../../types/enums";
import { ColumnType, GeneralObject } from "../../../types/general";
import Aligner from "../../Aligner";
import style from "./FilterModal.module.scss";

interface FilterModalType {
    tableTitle?: string;
    open: boolean;
    setOpen: (state: boolean) => void;
}

const FilterField = ({ field }: { field: ColumnType }) => {
    const filterContext = useContext(FilterContext);
    const hasAPI = !!field.fieldGetApi;
    const dataIndex = field.filterField?.dataIndex || "";

    const options = filterContext.filterFieldLists[dataIndex] || [];
    const loadingField = filterContext.filterFieldLoadings[dataIndex];

    const handleChange =
        (certainDataIndex = "") =>
        (event: any) => {
            const computedDataIndex = certainDataIndex || dataIndex;

            const initValue = field.filterField?.initValue || null;

            const isSelect = field.filterField?.type === Z_TableFieldTypes.enum.SELECT;
            const isMultiselect = field.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT;
            const isCondition = field.filterField?.type === Z_TableFieldTypes.enum.CONDITION;

            if (isSelect) {
                filterContext.setModalFilterValues((prevValues) => ({
                    ...prevValues,
                    [computedDataIndex]: event || initValue,
                }));
            } else if (isMultiselect) {
                const result = Array.isArray(event) ? event : [];
                filterContext.setModalFilterValues((prevValues) => ({
                    ...prevValues,
                    [computedDataIndex]: (result || []).join(",") || initValue,
                }));
            } else if (isCondition) {
                filterContext.setModalFilterValues((prevValues) => ({
                    ...prevValues,
                    [computedDataIndex]: (certainDataIndex ? event?.target?.value : event) || initValue,
                }));
                if (!certainDataIndex && !event) {
                    filterContext.setModalFilterValues((prevValues) => ({
                        ...prevValues,
                        [field.filterField?.conditionalDataIndex?.from || ""]: initValue,
                        [field.filterField?.conditionalDataIndex?.to || ""]: initValue,
                    }));
                }
            } else {
                filterContext.setModalFilterValues((prevValues) => ({
                    ...prevValues,
                    [computedDataIndex]: event?.target?.value || initValue,
                }));
            }
        };

    const getOptionValue = (option: GeneralObject) => (field.displayOptionDataIndex ? option.id.toString() : option);
    const getOptionTitle = (option: GeneralObject) =>
        field.displayOptionDataIndex ? option[field.displayOptionDataIndex] : option;

    const filterOption = (input: string, option: DefaultOptionType | undefined) => {
        if (!option?.children) return false;

        if (Array.isArray(option.children)) {
            return option.children.join(" ").toLowerCase().indexOf(input.toLowerCase()) >= 0;
        } else if (typeof option.children === "string") {
            return `${option.children}`.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }
        return false;
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
        <Select.Option key={getOptionValue(option)} value={getOptionValue(option)} style={{ width: "calc(100% - 16px)" }}>
            {getOptionTitle(option)}
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
                <Select {...commonSelectProps}>
                    {computedOptions}
                </Select>
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
                                    value={filterContext.modalFilterValues?.[field.filterField?.conditionalDataIndex?.to || ""]}
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
    return <div>{fieldType[field.filterField?.type as string]}</div>;
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

const FilterModal = ({ tableTitle = "", open, setOpen }: FilterModalType) => {
    const propsContext = useContext(PropsContext);
    const filterContext = useContext(FilterContext);
    const configContext = useContext(ConfigContext);
    const UI = useContext(UIContext);

    const closeModal = () => {
        setOpen(false);
    };

    const handleCancelFilter = () => {
        filterContext.setModalFilterValues(filterContext.filterValues);
        closeModal();
    };

    const handleConfirmFilter = () => {
        const computedFilterValues: GeneralObject = {};
        Object.keys(filterContext.modalFilterValues).forEach((filterField) => {
            if (
                filterContext.modalFilterValues[filterField] !==
                configContext.filterConfig.find((field) => field.filterField?.dataIndex === filterField)?.filterField
                    ?.initValue
            ) {
                computedFilterValues[filterField] = filterContext.modalFilterValues[filterField];
            }
        });

        propsContext.paginationConfig?.getData?.({
            ...filterContext.queryProps,
            filters: computedFilterValues,
        });

        filterContext.setFilterValues(computedFilterValues);
        closeModal();
    };

    const resetFilters = () => {
        filterContext.setModalFilterValues({});
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
                    const dataIndex = filterField.filterField?.dataIndex;
                    if (
                        dataIndex &&
                        filterContext.filterFieldLists[dataIndex] === undefined &&
                        !filterContext.filterFieldLoadings[dataIndex]
                    ) {
                        filterContext.setFilterFieldLoadings((prevList) => ({
                            ...prevList,
                            [dataIndex]: true,
                        }));
                        requester
                            .get(filterField.fieldGetApi)
                            .then((response) => {
                                filterContext.setFilterFieldLists((prevList) => ({
                                    ...prevList,
                                    [dataIndex]: response.data || [],
                                }));
                            })
                            .finally(() => {
                                filterContext.setFilterFieldLoadings((prevList) => ({
                                    ...prevList,
                                    [dataIndex]: false,
                                }));
                            });
                    }
                });
        }
    }, [open]);

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <FilterAltIcon sx={{ fontSize: 24 }} />
                {`Фильтр таблицы "${tableTitle}"`.trim()}
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

    const notFoundFilters =
        configContext.filterConfig.filter(
            (column) =>
                (column.filterField?.type === Z_TableFieldTypes.enum.SELECT ||
                    column.filterField?.type === Z_TableFieldTypes.enum.MULTISELECT ||
                    column.filterField?.type === Z_TableFieldTypes.enum.CONDITION) &&
                !column.fieldGetApi
        ) || ([] as any[]);

    const dependFields = configContext.filterConfig.filter(
        (column) => column.dependField && column.filterField?.dependType !== Z_DependencyTypes.enum.INDEP
    );

    return (
        <Modal {...modalProps}>
            <div className={style.filterContainer}>
                {notFoundFilters.length > 0 && (
                    <div style={{ color: "red" }}>
                        <span>Отсутствует API для следующих полей:</span>
                        <ul>
                            {notFoundFilters.map((columnFilter) => (
                                <li style={{ listStyleType: "disc" }} key={columnFilter[FLAG.path]}>
                                    {columnFilter.filterField?.title}
                                </li>
                            ))}
                        </ul>
                        <br />
                    </div>
                )}
                {dependFields.length > 0 && (
                    <div style={{ color: "coral" }}>
                        <ul>
                            {dependFields.map((columnFilter) => (
                                <li style={{ listStyleType: "disc" }} key={columnFilter[FLAG.path]}>
                                    {`${columnFilter.filterField?.dataIndex} DEPENDS ON ${columnFilter.dependField} (${columnFilter.filterField?.dependType})`}
                                </li>
                            ))}
                        </ul>
                        <br />
                    </div>
                )}
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
