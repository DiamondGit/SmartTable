import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataFetchContext from "../../../context/DataFetchContext";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";
import Row from "./Row";

const Body = ({ data, defaultRowCount }: { data: any[]; defaultRowCount: number }) => {
    const { tableConfig } = useContext(ConfigContext);
    const { isDataLoading } = useContext(DataFetchContext);

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
                        <Aligner
                            style={{
                                padding: "40px 0",
                                backgroundColor: "rgb(248, 248, 248)",
                            }}
                        >
                            <Aligner className={style.emptyBoxImg}>
                                <span className={style.label}>Нет данных</span>
                            </Aligner>
                        </Aligner>
                    </td>
                </tr>
            )}
        </>
    );
};

export default Body;
