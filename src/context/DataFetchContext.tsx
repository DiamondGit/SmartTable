import { AxiosResponse, CancelTokenSource } from "axios";
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

    isSingleData: boolean;
    setSignleData: React.Dispatch<React.SetStateAction<boolean>>;

    fetchResultDataIndex: string;
    setFetchResultDataIndex: React.Dispatch<React.SetStateAction<string>>;
    
    globalDependField: string;
    setGlobalDependField: React.Dispatch<React.SetStateAction<string>>;

    requestController: CancelTokenSource | undefined;
}

const DataFetchContext = createContext<DataFetchContextType>({} as DataFetchContextType);

export default DataFetchContext;
