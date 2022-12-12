import "./styles/resetStyles.css";
import style from "./styles/App.module.scss";
import _tableConfig_ from "./config/table.json";
import JsonPreviewer from "./components/JsonPreviewer";
import Table from "./components/Table";
import CenteredContainer from "./components/CenteredContainer";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import Autorenew from "@mui/icons-material/Autorenew";
import { TableConfigType } from "./types/general";

const App = () => {
    const [tableLoading, setTableLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [data, setData] = useState<any>([]);
    const [tableConfig, setTableConfig] = useState<TableConfigType>(_tableConfig_);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchPage = () => {
        setTableLoading(true);
        setTableConfig({ table: [] });

        setTimeout(() => {
            setTableLoading(false);
            setTableConfig(_tableConfig_);
        }, 1000);
    };

    const fetchData = () => {
        setDataLoading(true);
        setData([]);

        setTimeout(() => {
            setDataLoading(false);
            setData(
                [...Array(1)].map((rowData) => {
                    const result: { [key: string]: any } = {};
                    _tableConfig_.table.forEach((column) => {
                        result[column.dataIndex] = Math.floor(Math.random() * 100);
                    });
                    return result;
                })
            );
        }, 1000);
    };

    const handleClickFetchPage = () => {
        fetchPage();
    };

    const handleClickFetchData = () => {
        fetchData();
    };

    return (
        <div className={style.mainContainer}>
            <CenteredContainer>
                <JsonPreviewer json={tableConfig} />
                <LoadingButton
                    onClick={handleClickFetchPage}
                    endIcon={<Autorenew />}
                    loading={tableLoading}
                    loadingPosition="end"
                    variant="contained"
                >
                    Get page
                </LoadingButton>
                <LoadingButton
                    onClick={handleClickFetchData}
                    endIcon={<Autorenew />}
                    loading={dataLoading}
                    loadingPosition="end"
                    variant="contained"
                >
                    Refresh data
                </LoadingButton>
            </CenteredContainer>
            <Table
                data={data}
                tableConfig={tableConfig}
                tableLoading={tableLoading}
                dataLoading={dataLoading}
                loadingConfig={{
                    columnCount: 20,
                }}
            />
        </div>
    );
};

export default App;
