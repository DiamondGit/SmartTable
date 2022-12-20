import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useState } from "react";
import Aligner from "./components/Aligner";
import JsonPreviewer from "./components/JsonPreviewer";
import { TableType } from "./components/Table";
import _data_ from "./config/data.json";
import _tableConfig_ from "./config/table.json";
import TableConfigContext from "./context/TableConfigContext";
import MyTable from "./MyTable";
import style from "./styles/App.module.scss";
import "./styles/resetStyles.css";
import { TableConfigSchema } from "./types/general";

const defaultTableConfig = TableConfigSchema.parse(_tableConfig_);

const App = () => {
    const [jsonPreviewerVisible, setJsonPreviewerVisible] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [data, setData] = useState<{ [key: string]: any }[]>(hasData ? _data_ : []);
    const [tableConfig, setTableConfig] = useState(defaultTableConfig);

    const handleChangeFetchPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTableLoading(event.target.checked);

        if (!event.target.checked) {
            setTableConfig(defaultTableConfig);
        }
    };

    const handleChangeFetchData = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDataLoading(event.target.checked);
    };

    const handleChangeHasData = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHasData(event.target.checked);
        setData(event.target.checked ? _data_ : []);
    };

    const handleChangeJSONVisible = (event: React.ChangeEvent<HTMLInputElement>) => {
        setJsonPreviewerVisible(event.target.checked);
    };

    const tableProps: TableType = {
        title: "ПТО детали",
        data: data,
        tableLoading: tableLoading,
        dataLoading: dataLoading,
        loadingConfig: {
            columnCount: 3,
        },
    };

    return (
        <TableConfigContext.Provider
            value={{
                tableConfig: tableConfig,
                setTableConfig: setTableConfig,
            }}
        >
            <div className={style.mainContainer}>
                {jsonPreviewerVisible && (
                    <Aligner>
                        <Aligner isVertical>
                            Original
                            <JsonPreviewer json={defaultTableConfig} />
                        </Aligner>
                        <Aligner isVertical>
                            Edited
                            <JsonPreviewer json={tableConfig} />
                        </Aligner>
                    </Aligner>
                )}
                <Aligner style={{ marginTop: "24px" }}>
                    <FormGroup>
                        <Aligner>
                            <Aligner isVertical style={{ alignItems: "flex-start" }}>
                                <FormControlLabel
                                    disabled={dataLoading}
                                    control={<Switch checked={tableLoading} onChange={handleChangeFetchPage} />}
                                    label="Getting page"
                                />
                                <FormControlLabel
                                    disabled={tableLoading}
                                    control={<Switch checked={dataLoading} onChange={handleChangeFetchData} />}
                                    label="Refreshing data"
                                />
                            </Aligner>
                            <Aligner isVertical style={{ alignItems: "flex-start" }}>
                                <FormControlLabel
                                    disabled={dataLoading || tableLoading}
                                    control={<Switch checked={hasData} onChange={handleChangeHasData} />}
                                    label="With data"
                                />
                                <FormControlLabel
                                    control={<Switch checked={jsonPreviewerVisible} onChange={handleChangeJSONVisible} />}
                                    label="JSON preview"
                                />
                            </Aligner>
                        </Aligner>
                    </FormGroup>
                </Aligner>
                <MyTable {...tableProps} />
            </div>
        </TableConfigContext.Provider>
    );
};

export default App;
