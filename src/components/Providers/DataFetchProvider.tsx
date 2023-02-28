import { useState } from "react";
import DataFetchContext from "../../context/DataFetchContext";
import { requester } from "../../controllers/controllers";
import { Z_SortOptions } from "../../types/enums";

interface PaginationProviderType {
    children: React.ReactNode;
}

const DataFetchProvider = ({ children }: PaginationProviderType) => {
    const [data, setData] = useState<any[]>([]);
    const [dataComputedCount, setDataComputedCount] = useState({
        totalItems: 0,
        totalPages: 0,
    });
    const [isDataLoading, setDataLoading] = useState(false);
    const [isDataError, setDataError] = useState(false);

    const [dataGetApi, setDataGetApi] = useState("");
    const [dataCreateApi, setDataCreateApi] = useState("");
    const [dataUpdateApi, setDataUpdateApi] = useState("");
    const [dataDeleteApi, setDataDeleteApi] = useState("");

    const defaultPageSizeOptions = [10, 20, 50, 100];

    const getData = (params: { [key: string]: any }) => {
        if (dataGetApi) {
            setDataLoading(true);
            setDataError(false);

            const {
                currentPage = 1,
                pageSize = defaultPageSizeOptions[0] || 10,
                filters = {},
                search = "",
                sortField = "id",
                sortDir = Z_SortOptions.enum.DESC,
            } = params;

            requester
                .get(dataGetApi, {
                    params: {
                        pageSize: pageSize,
                        sortField: sortField,
                        sortDir: sortDir,
                        pageNo: currentPage,
                        search: search,
                        ...filters,
                    },
                })
                .then((response) => {
                    setData(response.data.transports || []);
                    setDataComputedCount({
                        totalItems: response.data.totalItems,
                        totalPages: response.data.totalPages,
                    });
                })
                .catch((error) => {
                    setDataError(true);
                })
                .finally(() => {
                    setDataLoading(false);
                });
        }
    };

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
            }}
        >
            {children}
        </DataFetchContext.Provider>
    );
};

export default DataFetchProvider;
