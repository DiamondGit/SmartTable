import { Skeleton } from "@mui/material";
import { TableConfigType } from "../../types/general";
import style from "./Table.module.scss";

interface TableType {
    data: any[];
    tableConfig: TableConfigType;
    tableLoading?: boolean;
    dataLoading?: boolean;
    loadingConfig?: {
        columnCount: number;
        rowCount?: number;
    };
}

interface SkeletonFillerType {
    columnCount: number;
    isHeading?: boolean;
    rowCount?: number;
}

const TableDataSkeleton = () => {
    return <Skeleton variant={"rectangular"} width={"100%"} height={"18px"} animation={"wave"} />;
};

const SkeletonFiller = ({ columnCount, isHeading = false, rowCount = 1 }: SkeletonFillerType) => {
    if (!isHeading)
        return (
            <>
                {[...Array(rowCount)].map((_, rowIndex) => {
                    const skeletons = [...Array(columnCount)].map((_, columnIndex) => (
                        <td key={`skeletonFiller_${rowIndex}_${columnIndex}`}>
                            <TableDataSkeleton />
                        </td>
                    ));
                    return (
                        <tr className={style.row} key={`skeletonFiller_${rowIndex}`}>
                            {skeletons}
                        </tr>
                    );
                })}
            </>
        );
    return (
        <>
            {[...Array(columnCount)].map((_, index) => (
                <th className={style.heading} key={"skeletonFiller_" + index}>
                    <TableDataSkeleton />
                </th>
            ))}
        </>
    );
};

const TableHead = ({ tableConfig }: { tableConfig: TableConfigType | null }) => {
    if (!tableConfig) return null;
    return (
        <>
            {tableConfig.table.map((column) => (
                <th className={style.heading} key={column.dataIndex}>
                    {column.title}
                </th>
            ))}
        </>
    );
};

const Table = ({ data, tableConfig, tableLoading, dataLoading, loadingConfig }: TableType) => {
    const loading = tableLoading || dataLoading;
    const computedLoadingConfig = {
        columnCount: loadingConfig?.columnCount || 4,
        rowCount: loadingConfig?.rowCount || 5,
    };
    const computedTableLoading = tableLoading && tableConfig !== null;

    return (
        <div className={style.tableContainer}>
            <div className={`${style.loadingCover} ${loading ? style.active : ""}`} />
            <table className={`${style.table} ${loading ? style.loading : ""}`}>
                <thead>
                    <tr className={style.row}>
                        {!computedTableLoading ? (
                            <TableHead tableConfig={tableConfig} />
                        ) : (
                            <SkeletonFiller columnCount={computedLoadingConfig.columnCount} isHeading />
                        )}
                    </tr>
                </thead>
                <tbody>
                    {!loading ? (
                        <>
                            {data.map((dataRow) => (
                                <tr className={style.row}>
                                    {Object.keys(dataRow).map((dataField) => (
                                        <td>
                                            {dataField}: {dataRow[dataField]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </>
                    ) : (
                        <SkeletonFiller
                            columnCount={dataLoading ? tableConfig?.table.length : computedLoadingConfig.columnCount}
                            rowCount={computedLoadingConfig.rowCount}
                        />
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
