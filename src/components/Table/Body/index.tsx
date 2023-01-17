import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";
import Row from "./Row";

const Body = ({ data }: { data: any[] }) => {
    const { tableConfig } = useContext(ConfigContext);

    if (!tableConfig) return null;
    return (
        <>
            {data.length > 0 ? (
                data.map((dataRow) => <Row dataRow={dataRow} key={dataRow.id} index={dataRow.id} />)
            ) : (
                <tr>
                    <td
                        colSpan={tableConfig.table.length}
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
