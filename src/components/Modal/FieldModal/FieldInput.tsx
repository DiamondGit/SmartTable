import { Input, InputRef, Select, Switch } from "antd";
import axios from "axios";
import { useContext, useRef } from "react";
import { ERR_CANCELED, PLACEHOLDER } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import FieldModalContext from "../../../context/FieldModalContext";
import { requester } from "../../../controllers/controllers";
import { filterOption, getOptionTitle, getOptionValue } from "../../../functions/global";
import { DependencyActionType, Z_DependencyActions, Z_TableFieldTypes } from "../../../types/enums";
import { ColumnType, GeneralObject } from "../../../types/general";

const FieldInput = ({ field: currentField, isError = false }: { field: ColumnType; isError: boolean }) => {
    const fieldModalContext = useContext(FieldModalContext);
    const configContext = useContext(ConfigContext);

    const { config, modalConfig, actions, isFilterModal, LOADINGS, LISTS, VALUES, CONTROLLERS } = fieldModalContext;

    const hasGetApi = !!currentField.fieldGetApi;
    const FIELD = currentField[config];
    const DATA_INDEX = FIELD?.dataIndex_write || "";

    const fieldOptions = LISTS[DATA_INDEX] || [];
    const isFieldLoading = LOADINGS[DATA_INDEX];

    const isDate = FIELD?.type === Z_TableFieldTypes.enum.DATE;
    const isNumber = FIELD?.type === Z_TableFieldTypes.enum.NUMBER;
    const isSelect = FIELD?.type === Z_TableFieldTypes.enum.SELECT;
    const isBoolean = FIELD?.type === Z_TableFieldTypes.enum.BOOLEAN;
    const isCondition = FIELD?.type === Z_TableFieldTypes.enum.CONDITION;
    const isMultiselect = FIELD?.type === Z_TableFieldTypes.enum.MULTISELECT;

    const currentValue = VALUES[DATA_INDEX] || FIELD?.initValue || (isMultiselect ? [] : null);

    const getValue = () => {
        if (isMultiselect) {
            if (typeof currentValue === "string") {
                return currentValue.split(",");
            }
        } else if (isCondition) {
        } else if (isBoolean) {
            if (FIELD?.booleanDataIndex) {
                if (currentValue) {
                    return FIELD?.booleanDataIndex.onFalse !== currentValue;
                }
                return FIELD?.booleanDataIndex.onTrue === FIELD.initValue;
            }
        }
        return currentValue;
    };

    const value = getValue();
    const isConditionBetween = value === "между";
    const isDepends = currentField.dependField !== undefined && !!FIELD?.dependType;
    const hasValue = value !== FIELD?.initValue;

    const updateDependencies = (targetDataIndex: string | undefined, newValue: any, isDirectDepends = false) => {
        if (!targetDataIndex) return;
        const dependFields = configContext[modalConfig].filter(
            (targetColumn) =>
                targetColumn.dependField &&
                ([] as string[]).concat(targetColumn.dependField).includes(targetDataIndex) &&
                targetColumn.onDependChange === Z_DependencyActions.enum.FETCH
        );
        dependFields.forEach((dependField) => {
            if (dependField[config]?.dataIndex_write) {
                const DEPEND_DATA_INDEX = dependField[config]?.dataIndex_write || "";

                if (typeof dependField.dependField === "string") {
                    actions.setListByDataIndex(DEPEND_DATA_INDEX, []);
                    actions.setValueByDataIndex(DEPEND_DATA_INDEX, null);
                    updateDependencies(DEPEND_DATA_INDEX, null);
                    if (isDirectDepends) {
                        actions.setLoadingByDataIndex(DEPEND_DATA_INDEX, true);
                        const computedParam = dependField.paramOnDepend
                            ? typeof dependField.paramOnDepend === "string"
                                ? dependField.paramOnDepend
                                : dependField.paramOnDepend[0]
                            : DEPEND_DATA_INDEX;
                        const source = axios.CancelToken.source();
                        CONTROLLERS[DEPEND_DATA_INDEX || ""]?.cancel();
                        requester
                            .get(dependField.fieldGetApi, {
                                params: { [computedParam]: newValue },
                                cancelToken: source.token,
                            })
                            .then((response) => {
                                actions.setListByDataIndex(DEPEND_DATA_INDEX, response.data || []);
                                actions.setLoadingByDataIndex(DEPEND_DATA_INDEX, false);
                            })
                            .catch((error) => {
                                if (error.code !== ERR_CANCELED) {
                                    actions.setLoadingByDataIndex(DEPEND_DATA_INDEX, false);
                                }
                            });
                        actions.setControllerByDataIndex(DEPEND_DATA_INDEX, source);
                    }
                } else {
                    const dependParams: GeneralObject = {};
                    for (let i = 0; i < dependField.dependField.length; i++) {
                        dependParams[
                            dependField.paramOnDepend && Array.isArray(dependField.paramOnDepend)
                                ? dependField.paramOnDepend[i] || dependField.dependField[i]
                                : dependField.dependField[i]
                        ] = dependField.dependField[i] === targetDataIndex ? newValue : VALUES[dependField.dependField[i]];
                    }

                    if (Object.values(dependParams).every((dependValue) => dependValue !== undefined)) {
                        actions.setListByDataIndex(DEPEND_DATA_INDEX, []);
                        actions.setValueByDataIndex(DEPEND_DATA_INDEX, null);
                        updateDependencies(DEPEND_DATA_INDEX, null);
                        if (isDirectDepends) {
                            actions.setLoadingByDataIndex(DEPEND_DATA_INDEX, true);
                            const source = axios.CancelToken.source();
                            CONTROLLERS[DEPEND_DATA_INDEX || ""]?.cancel();
                            requester
                                .get(dependField.fieldGetApi, { params: dependParams, cancelToken: source.token })
                                .then((response) => {
                                    actions.setListByDataIndex(DEPEND_DATA_INDEX, response.data || []);
                                    actions.setLoadingByDataIndex(DEPEND_DATA_INDEX, false);
                                })
                                .catch((error) => {
                                    if (error.code !== ERR_CANCELED) {
                                        actions.setLoadingByDataIndex(DEPEND_DATA_INDEX, false);
                                    }
                                });
                            actions.setControllerByDataIndex(DEPEND_DATA_INDEX, source);
                        }
                    }
                }
            }
        });
    };

    const handleChange =
        (certainDataIndex = "") =>
        (event: any) => {
            const computedDataIndex = certainDataIndex || DATA_INDEX;

            const initValue = FIELD?.initValue || null;

            if (isSelect) {
                const computedValue = event || initValue;
                actions.setValueByDataIndex(computedDataIndex, computedValue);
                updateDependencies(FIELD?.dataIndex_write, computedValue, true);
            } else if (isMultiselect) {
                const result = Array.isArray(event) ? event : [];
                actions.setValueByDataIndex(computedDataIndex, (result || []).join(",") || initValue);
            } else if (isCondition) {
                actions.setValueByDataIndex(
                    computedDataIndex,
                    (certainDataIndex ? event?.target?.value : event) || initValue
                );
                if (!certainDataIndex) {
                    if (!event) {
                        actions.setValueByDataIndex(FIELD?.conditionalDataIndex?.from, initValue);
                        actions.setValueByDataIndex(FIELD?.conditionalDataIndex?.to, initValue);
                    } else if (!isConditionBetween) {
                        actions.setValueByDataIndex(FIELD?.conditionalDataIndex?.to, initValue);
                    }
                }
            } else if (isBoolean) {
                actions.setValueByDataIndex(
                    computedDataIndex,
                    FIELD?.booleanDataIndex ? FIELD?.booleanDataIndex[!!event ? "onTrue" : "onFalse"] : !!event
                );
            } else {
                actions.setValueByDataIndex(computedDataIndex, event?.target?.value || initValue);
            }
        };

    const getPlaceholder = () => {
        const getDependTitle = (dependDataIndex: string) =>
            configContext.modalConfig.find((modalField) => modalField.field?.dataIndex_write === dependDataIndex)?.field
                ?.title;

        if (isFieldLoading) return PLACEHOLDER.loading;
        else if (!isDepends || currentField.dependField === undefined) return PLACEHOLDER.select(fieldOptions.length);
        else if (typeof currentField.dependField === "string") {
            if (VALUES[currentField.dependField] !== undefined) return PLACEHOLDER.select(fieldOptions.length);
            else return `${PLACEHOLDER.notSelected} ${getDependTitle(currentField.dependField)}`;
        }
        if (currentField.dependField.some((dependField) => VALUES[dependField] === undefined)) {
            return `${PLACEHOLDER.notSelected} ${currentField.dependField
                .filter((dependField) => VALUES[dependField] === undefined)
                .map((dependField) => getDependTitle(dependField))
                .join(", ")}`;
        }
        return PLACEHOLDER.select(fieldOptions.length);
    };

    const computedOptions = [...fieldOptions].map((option) => (
        <Select.Option
            key={getOptionValue(currentField, option)}
            value={getOptionValue(currentField, option)}
            style={{ width: "calc(100% - 16px)" }}
        >
            {getOptionTitle(currentField, option)}
        </Select.Option>
    ));

    const commonProps = {
        id: DATA_INDEX,
        onChange: handleChange(),
        disabled: fieldModalContext.modalLoading,
    };

    const commonFieldProps = {
        ...commonProps,
        value: LOADINGS[DATA_INDEX] ? undefined : value,
        placeholder: "Введите",
        style: { width: "100%" },
        allowClear: isFilterModal,
        status: isError ? ("error" as "error") : undefined,
    };

    const commonSelectProps = {
        ...commonFieldProps,
        showArrow: true,
        showSearch: true,
        placeholder: getPlaceholder(),
        disabled: !hasGetApi || fieldModalContext.modalLoading,
        loading: isFieldLoading,
        filterOption: filterOption,
    };

    const commonConditionProps = {
        ...commonProps,
        allowClear: false,
    };

    if (FIELD?.type === Z_TableFieldTypes.enum.NONE) return null;
    if (
        currentField.dependField &&
        typeof currentField.dependField === "string" &&
        !Array.isArray(currentField.onDependChange) &&
        typeof currentField.onDependChange === "object"
    ) {
        const isTrue = currentField.onDependChange?.value === VALUES[currentField.dependField];
        let operations: DependencyActionType[] = [];
        if (isTrue && currentField.onDependChange?.onTrue) {
            operations = operations.concat(currentField.onDependChange?.onTrue);
        } else if (!isTrue && currentField.onDependChange?.onFalse) {
            operations = operations.concat(currentField.onDependChange?.onFalse);
        }
        for (let i = 0; i < operations.length; i++) {
            if (operations[i] === Z_DependencyActions.enum.FETCH) {
                actions.setLoadingByDataIndex(DATA_INDEX, true);
                actions.setListByDataIndex(DATA_INDEX, []);
                actions.setValueByDataIndex(DATA_INDEX, null);
                requester
                    .get(currentField.fieldGetApi)
                    .then((response) => {
                        actions.setListByDataIndex(DATA_INDEX, response.data || []);
                        actions.setLoadingByDataIndex(DATA_INDEX, false);
                    })
                    .catch((error) => {
                        if (error.code !== ERR_CANCELED) {
                            actions.setLoadingByDataIndex(DATA_INDEX, false);
                        }
                    });
            } else if (operations[i] === Z_DependencyActions.enum.RESET) {
                actions.setValueByDataIndex(DATA_INDEX, FIELD?.initValue || null);
            }
        }
    }

    const getInputType = () => {
        if (isNumber) return "number";
        else if (isDate) return "date";
        return "text";
    };

    if (isBoolean) return <Switch {...commonProps} checked={value} />;
    else if (isSelect || isMultiselect)
        return (
            <Select {...commonSelectProps} mode={isMultiselect ? "multiple" : undefined}>
                {computedOptions}
            </Select>
        );
    else if (isCondition)
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: !hasValue ? "1fr" : !isConditionBetween ? "2fr 1fr" : "3fr 2fr auto 2fr",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <Select {...commonSelectProps}>{computedOptions}</Select>
                {hasValue && (
                    <>
                        <Input
                            {...commonConditionProps}
                            value={VALUES?.[FIELD?.conditionalDataIndex?.from || ""]}
                            onChange={handleChange(FIELD?.conditionalDataIndex?.from)}
                            type="number"
                        />
                        {isConditionBetween && (
                            <>
                                и
                                <Input
                                    {...commonConditionProps}
                                    value={VALUES?.[FIELD?.conditionalDataIndex?.to || ""]}
                                    onChange={handleChange(FIELD?.conditionalDataIndex?.to)}
                                    type="number"
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        );
    return <Input {...commonFieldProps} type={getInputType()} suffix={<span />} />;
};

export default FieldInput;
