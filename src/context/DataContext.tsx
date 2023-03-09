import { AxiosResponse, CancelTokenSource } from "axios";
import { createContext } from "react";
import { ModalTypes } from "../types/enums";
import { GeneralObject } from "../types/general";

export interface DataContextType {
    modalData: GeneralObject;
    setModalData: React.Dispatch<React.SetStateAction<GeneralObject>>;

    openDataModal: (modalType: ModalTypes, dataRow?: GeneralObject) => void;

    dataFieldLists: {
        [key: string]: any[];
    };
    setDataFieldLists: React.Dispatch<
        React.SetStateAction<{
            [key: string]: any[];
        }>
    >;

    dataFieldLoadings: {
        [key: string]: boolean;
    };
    setDataFieldLoadings: React.Dispatch<
        React.SetStateAction<{
            [key: string]: boolean;
        }>
    >;

    dataFieldErrors: {
        [key: string]: string;
    };
    setDataFieldErrors: React.Dispatch<
        React.SetStateAction<{
            [key: string]: string;
        }>
    >;

    dataOldValues: {
        [key: string]: any;
    };
    setDataOldValues: React.Dispatch<
        React.SetStateAction<{
            [key: string]: any;
        }>
    >;

    dataListToDelete: number[];
    setDataListToDelete: React.Dispatch<React.SetStateAction<number[]>>;

    dataFieldControllers: { [key: string]: CancelTokenSource };
    setDataFieldControllers: React.Dispatch<React.SetStateAction<{ [key: string]: CancelTokenSource }>>;

    isSelectingToDelete: boolean;
    setSelectingToDelete: React.Dispatch<React.SetStateAction<boolean>>;

    isDeleting: boolean;
    setDeleting: React.Dispatch<React.SetStateAction<boolean>>;

    isDeletingError: boolean;
    setDeletingError: React.Dispatch<React.SetStateAction<boolean>>;

    isFetchRequired: boolean;
    setFetchRequired: React.Dispatch<React.SetStateAction<boolean>>;
    
    isCancelingDelete: boolean;
    setCancelingDelete: React.Dispatch<React.SetStateAction<boolean>>;

    availableData: any[];
    setAvailableData: React.Dispatch<React.SetStateAction<any[]>>;

    isFullscreen: boolean;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export default DataContext;
