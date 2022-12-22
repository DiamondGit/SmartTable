import Aligner from "./components/Aligner";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";

const App = () => {
    const tableProps = {
        tableTitle: "ПТО детали",
        tableName: "PTO_DETAILS",
        userId: 27,
        loadingConfig: { columnCount: 3 },
    };

    return (
        <Aligner>
            <div style={{ padding: "100px 200px", width: "100%" }}>
                <MyTable {...tableProps} />
            </div>
        </Aligner>
    );
};

export default App;
