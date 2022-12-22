import { TableConfigType } from "../../types/general";
import style from "./Table.module.scss";

const TableHead = ({ tableConfig }: { tableConfig: TableConfigType | null }) => {
    const handleClick = (dataIndex: string) => () => {
        console.log("Click", dataIndex);
    }

    if (!tableConfig) return null;
    return (
        <>
            <th className={style.actionCell}>
            </th>
            {tableConfig.table
                .filter((column) => !column.hidable || column.visible)
                .map((column) => (
                    <th key={column.dataIndex} onClick={handleClick(column.dataIndex)}>
                        {column.title}
                    </th>
                ))}
        </>
    );
};

export default TableHead;
