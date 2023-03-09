import { Button, Form, Segmented, Switch } from "antd";
import { useState } from "react";
import Aligner from "./components/Aligner";
import LoginForm from "./LoginForm";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";
import DescriptionIcon from '@mui/icons-material/Description';
import CachedIcon from '@mui/icons-material/Cached';
import UploadIcon from '@mui/icons-material/Upload';

const storageUser = localStorage.getItem("user");
const userToken = (storageUser && JSON.parse(storageUser)?.token) || "";

const companies = [
    {
        title: "Все предприятия",
        value: null,
    },
    {
        title: 'АО "ССГПО"',
        value: 29995,
    },
];


const App = () => {
    const [isAuthorized] = useState(!!userToken);
    const [companyId, setCompanyId] = useState<number | null>(null);
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

    const functionModifier = [
        {
            title: "Импорт",
            icon: <DescriptionIcon sx={{ transform: "scale(1.5)" }} />,
            disabled: true,
            onClick: () => {
                alert("clicked Import");
            },
        },
        {
            title: "Перерасчет",
            icon: <CachedIcon sx={{ transform: "scale(1.5)" }} />,
            onClick: () => {
                console.log("clicked Recalculate");
            },
        },
        {
            title: "Загрузить",
            icon: <UploadIcon sx={{ transform: "scale(1.5)" }} />,
            onClick: () => {
                console.log("clicked Upload");
            },
        },
    ];

    const handleRefreshTable = () => {
        setDataRefreshTrigger(() => Date.now());
    };

    const handleChangeCompany = (newCompany: any) => {
        setCompanyId(companies.find((company) => company.title === newCompany)?.value || null);
    };

    const [isTableVisible, setTableVisible] = useState(true);
    const handleChangeTableVisible = () => {
        setTableVisible((prevValue) => !prevValue);
    };

    return (
        <Aligner>
            <div style={{ padding: "100px 200px", width: "100%" }}>
                <Aligner style={{ justifyContent: "flex-start", marginBottom: "24px" }}>
                    <Button onClick={handleRefreshTable}>Обновить данные</Button>
                    <div>
                        <Segmented
                            options={companies.map((company) => company.title)}
                            value={companies.find((company) => company.value === companyId)?.title}
                            onChange={handleChangeCompany}
                        />
                    </div>
                    <Form.Item style={{ margin: 0 }} label="Скрыть таблицу">
                        <Switch checked={isTableVisible} onChange={handleChangeTableVisible} />
                    </Form.Item>
                </Aligner>
                <LoginForm />
                {isAuthorized && isTableVisible && (
                    <>
                        <br />
                        <MyTable
                            {...{
                                tableTitle: "Транспорты",
                                configPath: "TRANSPORT/TRANSPORTS",
                                loadingConfig: { columnCount: 12 },
                                dataRefreshTrigger,
                                contentModifier,
                                functionModifier,
                                userToken,
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
