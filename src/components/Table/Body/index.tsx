import { Result } from "antd";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataFetchContext from "../../../context/DataFetchContext";
import style from "../Table.module.scss";
import Row from "./Row";

const Body = ({ data, defaultRowCount }: { data: any[]; defaultRowCount: number }) => {
    const { tableConfig } = useContext(ConfigContext);
    const { isDataLoading } = useContext(DataFetchContext);
    const emptyBox = require("../../../pictures/empty-box.png");

    if (!tableConfig) return null;
    return (
        <>
            {data.length > 0 || isDataLoading ? (
                (!isDataLoading ? data : [...Array(defaultRowCount)].map((_, index) => ({ id: index }))).map((dataRow) => (
                    <Row dataRow={dataRow} key={dataRow.id} index={dataRow.id} />
                ))
            ) : (
                <tr>
                    <td
                        colSpan={(tableConfig.table.length || 0) + 1}
                        className={style.errorContent}
                        style={{
                            padding: 0,
                        }}
                    >
                        <div className={style.resultContainer}>
                            <Result
                                status="info"
                                title="Нет данных"
                                icon={<img width={150} src={emptyBox} alt="Нет данных" />}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default Body;
