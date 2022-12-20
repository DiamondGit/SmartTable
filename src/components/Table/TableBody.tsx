import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useContext, useState } from "react";
import TableConfigContext from "../../context/TableConfigContext";
import Aligner from "../Aligner";
import style from "./Table.module.scss";

const TableBody = ({
    data,
    selectedRows,
    setSelectedRows,
}: {
    data: any[];
    selectedRows: number[];
    setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
    const { tableConfig } = useContext(TableConfigContext);
    if (!tableConfig) return null;

    const Row = ({ dataRow, index }: { dataRow: any; index: number }) => {
        const [isClicked, setClicked] = useState(selectedRows.includes(index));

        const toggleRowClick = (event: React.MouseEvent<HTMLElement>) => {
            if (event.ctrlKey) {
                setClicked((prevState) => !prevState);
                setSelectedRows((prevState) => [...prevState, index]);
            }
        };

        return (
            <tr className={`${style.row} ${isClicked ? style.clicked : ""}`} onClick={toggleRowClick}>
                {tableConfig.table
                    .filter((column) => !column.hidable || column.visible)
                    .map((column, i) => (
                        <td key={`tableBody_${index}_${column.dataIndex}`}>
                            <div
                                style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "12px" }}
                            >
                                {i === 0 && <MoreVertIcon />}
                                {dataRow[column.dataIndex]}
                            </div>
                        </td>
                    ))}
            </tr>
        );
    };

    return (
        <>
            {data.length > 0 ? (
                data.map((dataRow) => <Row dataRow={dataRow} key={dataRow.id} index={dataRow.id} />)
            ) : (
                <tr className={style.row}>
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
                            <div className={style.boxLogo}>
                                <span className={style.label}>Нет данных</span>
                            </div>
                        </Aligner>
                    </td>
                </tr>
            )}
        </>
    );
};

export default TableBody;