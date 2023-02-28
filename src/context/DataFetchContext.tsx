import { AxiosResponse } from "axios";
import { createContext } from "react";
import { GeneralObject } from "../types/general";

export interface DataFetchContextType {
    data: any[],
    dataComputedCount: {
        totalItems: number;
        totalPages: number;
    };

    isDataError: boolean;
    setDataLoading: React.Dispatch<React.SetStateAction<boolean>>;

    isDataLoading: boolean;

    dataGetApi: string;
    setDataGetApi: React.Dispatch<React.SetStateAction<string>>;

    dataCreateApi: string;
    setDataCreateApi: React.Dispatch<React.SetStateAction<string>>;

    dataUpdateApi: string;
    setDataUpdateApi: React.Dispatch<React.SetStateAction<string>>;
    
    dataDeleteApi: string;
    setDataDeleteApi: React.Dispatch<React.SetStateAction<string>>;

    getData: (dataRequestParams: GeneralObject) => void;
    createData: (dataRequestParams: GeneralObject) => Promise<AxiosResponse<any, any>>;
    updateData: (dataRequestParams: GeneralObject) => Promise<AxiosResponse<any, any>>;
    deleteData: (dataId: number) => Promise<AxiosResponse<any, any>>;

    defaultPageSizeOptions: number[];
}

const DataFetchContext = createContext<DataFetchContextType>({} as DataFetchContextType);

export default DataFetchContext;
