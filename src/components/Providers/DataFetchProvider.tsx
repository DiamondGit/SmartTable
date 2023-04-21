import axios, { CancelTokenSource } from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { ERR_CANCELED } from "../../constants/general";
import DataFetchContext from "../../context/DataFetchContext";
import PropsContext from "../../context/PropsContext";
import { Z_SortOptions } from "../../types/enums";
import { GeneralObject } from "../../types/general";

interface PaginationProviderType {
    children: React.ReactNode;
}

const DataFetchProvider = ({ children }: PaginationProviderType) => {
    const propsContext = useContext(PropsContext);

    const [data, setData] = useState<any[]>([]);
    const [dataComputedCount, setDataComputedCount] = useState({
        totalItems: 0,
        totalPages: 0,
    });

    const [requestController, setRequestController] = useState<CancelTokenSource>();
    const requestControllerRef = useRef(requestController);

    const [isDataLoading, setDataLoading] = useState(false);
    const [isDataError, setDataError] = useState(false);

    const [isConfigFetched, setConfigFetched] = useState(false);
    const [dataGetApi, setDataGetApi] = useState("");
    const [dataCreateApi, setDataCreateApi] = useState("");
    const [dataUpdateApi, setDataUpdateApi] = useState("");
    const [dataDeleteApi, setDataDeleteApi] = useState("");

    const [isSingleData, setSignleData] = useState(false);
    const [fetchResultDataIndex, setFetchResultDataIndex] = useState("");
    const [globalDependField, setGlobalDependField] = useState("");

    const [hasGetApi, setHasGetApi] = useState(true);

    const [columnWidthRefreshTrigger, setColumnWidthRefreshTrigger] = useState(Date.now());

    const defaultPageSizeOptions = [10, 20, 50, 100];

    const requester = axios.create({
        headers: {
            Authorization: `Bearer ${propsContext.userToken || ""}`,
        },
    });

    const getData = (params: { [key: string]: any }) => {
        if (!isConfigFetched) return;
        requestController?.cancel();

        const {
            currentPage = 1,
            pageSize = defaultPageSizeOptions[0] || 10,
            filters = {},
            search = "",
            sortField = "id",
            sortDir = Z_SortOptions.enum.DESC,
        } = params;

        const dependency: GeneralObject = {};
        if (globalDependField) {
            dependency[globalDependField] = propsContext.globalDependencies?.[globalDependField] || null;
        }

        const cancelSource = axios.CancelToken.source();
        if (dataGetApi) {
            setHasGetApi(true);
            setDataLoading(true);
            setDataError(false);
            requester
                .get(dataGetApi, {
                    cancelToken: cancelSource.token,
                    params: !isSingleData
                        ? {
                              pageSize: pageSize,
                              sortField: sortField,
                              sortDir: sortDir,
                              pageNo: currentPage,
                              search: search,
                              ...dependency,
                              ...filters,
                          }
                        : {},
                })
                .then((response) => {
                    let fetchResult = [];
                    if (fetchResultDataIndex) {
                        fetchResult = response.data[fetchResultDataIndex] || [];
                        if (!Array.isArray(fetchResult)) fetchResult = [];
                    }
                    setData(fetchResult);
                    setDataComputedCount({
                        totalItems: response.data.totalItems,
                        totalPages: response.data.totalPages,
                    });
                    setDataLoading(false);
                })
                .catch((error) => {
                    if (error.code !== ERR_CANCELED) {
                        setDataError(true);
                        setDataLoading(false);
                    }
                }).finally(() => {
                    setColumnWidthRefreshTrigger(Date.now())
                });
        } else {
            setHasGetApi(false);
            setDataError(true);
        }

        requestControllerRef.current = cancelSource;
        setRequestController(() => cancelSource);
    };

    useEffect(() => {
        return () => {
            requestControllerRef.current?.cancel();
        };
    }, []);

    const createData = async (params: { [key: string]: any }) => {
        return await requester.post(dataCreateApi, params);
    };

    const updateData = async (params: { [key: string]: any }) => {
        return await requester.put(dataUpdateApi, params);
    };

    const deleteData = async (transportId: number) => {
        return await requester.put(`${dataDeleteApi}${transportId}`);
    };

    return (
        <DataFetchContext.Provider
            value={{
                data,
                dataComputedCount,

                isDataLoading,
                setDataLoading,

                isDataError,

                dataGetApi,
                setDataGetApi,

                dataCreateApi,
                setDataCreateApi,

                dataUpdateApi,
                setDataUpdateApi,

                dataDeleteApi,
                setDataDeleteApi,

                getData,
                createData,
                updateData,
                deleteData,

                defaultPageSizeOptions,

                isSingleData,
                setSignleData,

                fetchResultDataIndex,
                setFetchResultDataIndex,

                globalDependField,
                setGlobalDependField,

                requestController,

                columnWidthRefreshTrigger,

                hasGetApi,

                requester,

                isConfigFetched,
                setConfigFetched,
            }}
        >
            {children}
        </DataFetchContext.Provider>
    );
};

export default DataFetchProvider;
