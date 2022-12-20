import { TableConfigType } from "../../types/general";
import style from "./Table.module.scss";

const TableHead = ({ tableConfig }: { tableConfig: TableConfigType | null }) => {
    if (!tableConfig) return null;
    return (
        <>
            {tableConfig.table
                .filter((column) => !column.hidable || column.visible)
                .map((column) => (
                    <th className={style.heading} key={column.dataIndex}>
                        {column.title}
                    </th>
                ))}
        </>
    );
};

export default TableHead;

// "hidable": true
// "visible": true


// "hidable": true     *
// "visible": false


// "hidable": false
// "visible": true


// "hidable": false
// "visible": false


