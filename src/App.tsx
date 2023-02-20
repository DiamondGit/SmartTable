import Aligner from "./components/Aligner";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";
import { useState } from "react";
import axios from "axios";
import LoginForm from "./LoginForm";
import { Button } from "antd";

const storageUser = localStorage.getItem("user");
const token = (storageUser && JSON.parse(storageUser)?.token) || "";

const App = () => {
    const [isAuthorized] = useState(!!token);
    const [companyId] = useState(null);
    const [dataRefreshTrigger, setDataRefreshTrigger] = useState(Date.now());

    const [data, setData] = useState<any[]>([]);
    const [dataComputedCount, setDataComputedCount] = useState({
        totalItems: 0,
        totalPages: 0,
    });
    const [isDataLoading, setDataLoading] = useState(false);
    const [isDataError, setDataError] = useState(false);

    const getData = (params: { [key: string]: any }) => {
        if (isAuthorized) {
            setDataLoading(true);
            setDataError(false);

            const { currentPage, pageSize, filters = {}, search = "", sortField = "id", sortDir = "DESC" } = params;

            axios
                .get("/transports-dimensions//transport/all-enabled-only-transports/page", {
                    params: {
                        pageSize: pageSize,
                        sortField: sortField,
                        sortDir: sortDir,
                        pageNo: currentPage,
                        search: search,
                        ...filters,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setData(response.data.transports);
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

    //provides list of modificators for custom datas
    const contentModifier = {
        segment: (record: { [key: string]: any }) => (
            <div style={record.equipment ? {} : { color: "red" }}>{record.segment}</div>
        ),
        "size.width.inch": (record: { [key: string]: any }) => (
            <div>{(parseFloat(record.size.width.meter) * 39.36).toFixed(2)}</div>
        ),
    };

    const handleRefreshTable = () => {
        setDataRefreshTrigger(() => Date.now());
    };

    return (
        <Aligner>
            <div style={{ padding: "100px 200px", width: "100%" }}>
                <Button onClick={handleRefreshTable}>Обновить данные</Button>
                <LoginForm />
                {isAuthorized && (
                    <>
                        <br />
                        <MyTable
                            {...{
                                tableTitle: "Транспорты",
                                configPath: "TRANSPORT/TRANSPORTS",
                                loadingConfig: { columnCount: 12 },
                                paginationConfig: {
                                    dataComputedCount,
                                    getData,
                                },
                                dataRefreshTrigger,
                                contentModifier,
                                data,
                                isDataLoading,
                                isDataError,
                                globalDependencies: {
                                    companyId,
                                },
                            }}
                        />
                    </>
                )}
            </div>
        </Aligner>
    );
};

export default App;
