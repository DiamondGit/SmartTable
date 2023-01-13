import Aligner from "./components/Aligner";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";

const App = () => {
    return (
        <Aligner>
            <div style={{ padding: "100px 200px", width: "100%" }}>
                <MyTable
                    {...{
                        tableTitle: "ПТО детали",
                        tableName: "PTO_DETAILS",
                        userId: 27,
                        // saveLocally: true,
                        loadingConfig: { columnCount: 3 },
                        paginationConfig: {
                            perPageFetch: false,
                            showSizeChanger: true,
                            showTotal: true,
                        },
                    }}
                />
            </div>
        </Aligner>
    );
};

export default App;
