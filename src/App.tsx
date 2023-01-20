import Aligner from "./components/Aligner";
import MyTable from "./MyTable";
import "./styles/resetStyles.css";

const App = () => {
    const contentModifier = {
        segment: (record: { [key: string]: any }) => (
            <div style={record.equipment ? {} : { color: "red" }}>{record.segment}</div>
        ),
        "size.width.inch": (record: { [key: string]: any }) => (
            <div>{(parseFloat(record.size.width.meter) * 39.36).toFixed(2)}</div>
        ),
    };

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
                        contentModifier: contentModifier,
                    }}
                />
            </div>
        </Aligner>
    );
};

export default App;
