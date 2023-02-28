import Aligner from "./components/Aligner";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";
import { useState } from "react";
import LoginForm from "./LoginForm";
import { Button } from "antd";

const storageUser = localStorage.getItem("user");
const token = (storageUser && JSON.parse(storageUser)?.token) || "";

const App = () => {
    const [isAuthorized] = useState(!!token);
    const [companyId] = useState(null);
    const [dataRefreshTrigger, setDataRefreshTrigger] = useState(Date.now());

    const hasAccessToCreate = true;
    const hasAccessToUpdate = true;
    const hasAccessToDelete = true;

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
                                dataRefreshTrigger,
                                contentModifier,
                                globalDependencies: {
                                    companyId,
                                },
                                hasAccessTo: {
                                    create: hasAccessToCreate,
                                    update: hasAccessToUpdate,
                                    delete: hasAccessToDelete,
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
