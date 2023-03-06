import { CancelTokenSource } from "axios";
import { createContext } from "react";
import { GeneralObject } from "../types/general";

export type FieldModalConfigType = "modalConfig" | "filterConfig";
export type FieldFieldConfigType = "field" | "filterField";
export type FieldActionType = "data" | "filter";

export interface FieldModalContextType {
    isModalOpen: boolean;

    isAddModal: boolean;
    isAddBasedModal: boolean;
    isUpdateModal: boolean;
    isDataModal: boolean;
    isFilterModal: boolean;

    hasCreateApi: boolean;
    hasUpdateApi: boolean;

    modalLoading: boolean;

    modalConfig: FieldModalConfigType;
    config: FieldFieldConfigType;

    actions: {
        cleanLoadings: () => void;
        setLoadingByDataIndex: (dataIndex: string | undefined, value: boolean) => void;

        cleanLists: () => void;
        setListByDataIndex: (dataIndex: string | undefined, value: any[]) => void;

        setValueByDataIndex: (dataIndex: string | undefined, value: any) => void;

        setControllerByDataIndex: (dataIndex: string | undefined, controller: CancelTokenSource) => void;

        setModalDataValue: (value: GeneralObject) => void;
        setModalFilterValue: (value: GeneralObject) => void;
        setFilterValue: (value: GeneralObject) => void;

        resetFieldsByGlobalDepend: (globalDepend: string) => void;
    };

    LOADINGS: {
        [key: string]: boolean;
    };
    LISTS: {
        [key: string]: any[];
    };
    VALUES: GeneralObject;
    CONTROLLERS: {
        [key: string]: CancelTokenSource;
    };
}

const FieldModalContext = createContext<FieldModalContextType>({} as FieldModalContextType);

export default FieldModalContext;
