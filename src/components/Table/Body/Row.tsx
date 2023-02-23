import { Checkbox, ConfigProvider as AntdConfigProvider } from "antd";
import { useContext, useRef } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import TableBodyContext from "../../../context/TableBodyContext";
import { Z_TablePinOptions } from "../../../types/enums";
import ActionMenu from "../../ActionMenu";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";
import Side from "./Side";

const Row = ({ dataRow, index }: { dataRow: any; index: number }) => {
    const dataContext = useContext(DataContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const { hasLeftPin } = useContext(ConfigContext);

    const handleSelectRow = () => {
        if (!dataContext.isDeleting) {
            dataContext.setDataListToDelete((prevList) => {
                if (prevList.includes(dataRow.id))
                    return [...prevList].filter((selectedRowId) => selectedRowId !== dataRow.id);
                return [...prevList, dataRow.id];
            });

            if (dataContext.isDeletingError) {
                dataContext.setDeletingError(false);
            }
        }
    };

    const rowClasses = [];
    if (dataContext.dataListToDelete.includes(dataRow.id)) rowClasses.push(style.selected);
    if (dataContext.isDeletingError) rowClasses.push(style.deletingError);

    return (
        <TableBodyContext.Provider
            value={{
                dataRow,
                index,
            }}
        >
            <tr className={rowClasses.join(" ")}>
                <td
                    className={style.actionCell}
                    style={hasLeftPin ? { position: "sticky", left: 0 } : {}}
                    ref={actionCellRef}
                >
                    {dataContext.isSelectingToDelete ? (
                        <Aligner style={{ margin: "0 4px" }}>
                            <AntdConfigProvider
                                theme={
                                    dataContext.isDeletingError
                                        ? {
                                              token: {
                                                  colorPrimary: "#ff5555",
                                              },
                                          }
                                        : undefined
                                }
                            >
                                <Checkbox
                                    disabled={dataContext.isDeleting}
                                    onChange={handleSelectRow}
                                    checked={dataContext.dataListToDelete.includes(dataRow.id)}
                                />
                            </AntdConfigProvider>
                        </Aligner>
                    ) : (
                        <Aligner>
                            <ActionMenu dataRow={dataRow} />
                        </Aligner>
                    )}
                </td>
                <Side side={Z_TablePinOptions.enum.LEFT} />
                <Side />
                <Side side={Z_TablePinOptions.enum.RIGHT} />
            </tr>
        </TableBodyContext.Provider>
    );
};

export default Row;
