import { useContext, useState } from "react";
import TableConfigContext from "../../context/TableConfigContext";
import TableUIContext from "../../context/TableUIContext";
import "../../styles/global.scss";
import { TableUIType } from "../../types/general";
import SettingsModal from "../Modal/SettingsModal";
import SkeletonFiller from "./SkeletonFiller";
import style from "./Table.module.scss";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import TopBar from "./TopBar";

export interface TableType {
    title: string;
    data: any[];
    tableLoading?: boolean;
    dataLoading?: boolean;
    loadingConfig?: {
        columnCount: number;
        rowCount?: number;
        noFuncBtnsLeft?: boolean;
        noFuncBtnsRight?: boolean;
    };
}

interface TableStartingType extends TableType {
    UI: TableUIType;
}

const Table = ({ title, data, tableLoading = true, dataLoading = true, loadingConfig, UI }: TableStartingType) => {
    const { tableConfig } = useContext(TableConfigContext);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isFullscreen, setFullscreen] = useState(false);

    const loading = tableLoading || dataLoading;
    const computedLoadingConfig = {
        columnCount: dataLoading
            ? tableConfig?.table.filter((column) => column.visible).length
            : loadingConfig?.columnCount || 4,
        rowCount: loadingConfig?.rowCount || 5,
        noFuncBtnsLeft: loadingConfig?.noFuncBtnsLeft || false,
        noFuncBtnsRight: loadingConfig?.noFuncBtnsRight || false,
    };
    const computedTableLoading = tableLoading && tableConfig !== null;
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const toggleFullscreen = () => {
        setFullscreen((prevState) => !prevState);
    };

    const openSettingsModal = () => {
        setSettingsModalOpen(true);
    };

    const tableContainerClasses = [style.tableContainer];
    if (isFullscreen) tableContainerClasses.push(style.fullscreen);

    const tableClasses = [style.table];
    if (loading) tableClasses.push(style.loading);

    return (
        <TableUIContext.Provider value={UI}>
            <div className={tableContainerClasses.join(" ")}>
                <SettingsModal open={isSettingsModalOpen} setOpen={setSettingsModalOpen} tableName={title} />
                <TopBar
                    title={title}
                    tableLoading={tableLoading}
                    dataLoading={dataLoading}
                    isFullscreen={isFullscreen}
                    computedLoadingConfig={computedLoadingConfig}
                    toggleFullscreen={toggleFullscreen}
                    openSettingsModal={openSettingsModal}
                />
                <table className={tableClasses.join(" ")}>
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
                            <TableBody data={data} selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
                        ) : (
                            <SkeletonFiller
                                columnCount={computedLoadingConfig.columnCount}
                                rowCount={computedLoadingConfig.rowCount}
                            />
                        )}
                    </tbody>
                </table>
            </div>
        </TableUIContext.Provider>
    );
};

export default Table;
