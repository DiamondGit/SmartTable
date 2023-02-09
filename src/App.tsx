import Aligner from "./components/Aligner";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";
import { useState, useEffect } from "react";
import axios from "axios";
import LoginForm from "./LoginForm";

const storageUser = localStorage.getItem("user");
const token = (storageUser && JSON.parse(storageUser)?.token) || "";

const App = () => {
    const [isAuthorized] = useState(!!token);

    const [data, setData] = useState<any[]>([]);
    const [dataComputedCount, setDataComputedCount] = useState({
        totalItems: 0,
        totalPages: 0,
    });
    const [isDataLoading, setDataLoading] = useState(false);
    const [isDataError, setDataError] = useState(false);

    const getData = (currentPage: number, pageSize: number, sortField = "id", sortDir = "DESC") => {
        if (isAuthorized) {
            setDataLoading(true);
            setDataError(false);
            axios
                .get("/transports-dimensions//transport/all-enabled-only-transports/page", {
                    params: {
                        pageSize: pageSize,
                        sortField: sortField,
                        sortDir: sortDir,
                        pageNo: currentPage,
                        search: "",
                        modelName: "",
                        garageNo: "",
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

    //provides list of APIs for filter fields
    const filterApiProvider = {
        region: "/region/get-all",
        subregion: "/subregion/get-all",
    };

    return (
        <Aligner>
            <div style={{ padding: "100px 200px", width: "100%" }}>
                <LoginForm />
                {isAuthorized && (
                    <>
                        <br />
                        <MyTable
                            {...{
                                tableTitle: "ПТО детали",
                                tableConfigPath: "PTO/DETAILS",
                                loadingConfig: { columnCount: 8 },
                                paginationConfig: {
                                    dataComputedCount,
                                    getData,
                                },
                                contentModifier,
                                filterApiProvider,
                                data,
                                isDataLoading,
                                isDataError,
                            }}
                        />
                    </>
                )}
            </div>
        </Aligner>
    );
};

export default App;
