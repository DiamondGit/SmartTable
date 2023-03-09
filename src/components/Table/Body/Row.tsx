import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import { Checkbox, ConfigProvider as AntdConfigProvider, message } from "antd";
import { useContext, useRef } from "react";
import { DELETE_OPTION } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import StateContext from "../../../context/StateContext";
import TableBodyContext from "../../../context/TableBodyContext";
import { Z_ModalTypes, Z_TablePinOptions } from "../../../types/enums";
import { ActionMenuType } from "../../../types/general";
import ActionMenu from "../../ActionMenu";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";
import Side from "./Side";

const Row = ({ dataRow, index }: { dataRow: any; index: number }) => {
    const dataContext = useContext(DataContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const configContext = useContext(ConfigContext);
    const stateContext = useContext(StateContext);

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

    const actionMenuOptions: ActionMenuType = [];

    if (configContext.defaultTableConfig?.creatable && stateContext.canCreate)
        actionMenuOptions.push({
            Icon: ControlPointDuplicateIcon,
            text: "Создать на основе",
            value: Z_ModalTypes.enum.ADD_BASED,
            color: "#7ABB6D",
        });
    if (configContext.defaultTableConfig?.updatable && stateContext.canUpdate)
        actionMenuOptions.push({
            Icon: EditIcon,
            text: "Изменить",
            value: Z_ModalTypes.enum.UPDATE,
            color: "#F5A225",
        });
    if (configContext.defaultTableConfig?.deletable && stateContext.canDelete)
        actionMenuOptions.push({
            Icon: DeleteOutlineIcon,
            text: "Удалить",
            value: DELETE_OPTION,
            color: "#FA6855",
        });

    const handleClickActionOption = (option: string) => () => {
        if (option === Z_ModalTypes.enum.ADD_BASED || option === Z_ModalTypes.enum.UPDATE) {
            dataContext.openDataModal(option, dataRow);
        } else if (option === DELETE_OPTION) {
            if (!!configContext.defaultTableConfig?.dataDeleteApi) {
                dataContext.setSelectingToDelete(true);
                dataContext.setDataListToDelete((prevList) => [...prevList, dataRow.id]);
            } else {
                message.warning("Отсутствует API удаления данных!");
            }
        }
    };

    const rowClasses = [];
    if (dataContext.dataListToDelete.includes(dataRow.id)) rowClasses.push(style.selected);
    if (dataContext.isDeletingError) rowClasses.push(style.deletingError);

    const ActionButtonIcon = actionMenuOptions[0]?.Icon;

    return (
        <TableBodyContext.Provider
            value={{
                dataRow,
                index,
            }}
        >
            <tr className={rowClasses.join(" ")}>
                {configContext.hasActionColumn && (
                    <td
                        className={style.actionCell}
                        style={configContext.hasLeftPin ? { position: "sticky", left: 0 } : {}}
                        ref={actionCellRef}
                    >
                        {dataContext.isSelectingToDelete ? (
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
                                <Aligner style={{ margin: "0 4px" }}>
                                    <Checkbox
                                        disabled={dataContext.isDeleting}
                                        onChange={handleSelectRow}
                                        checked={dataContext.dataListToDelete.includes(dataRow.id)}
                                    />
                                </Aligner>
                            </AntdConfigProvider>
                        ) : (
                            <Aligner>
                                {actionMenuOptions.length > 1 ? (
                                    <ActionMenu
                                        actionMenuOptions={actionMenuOptions}
                                        handleClickActionOption={handleClickActionOption}
                                    />
                                ) : (
                                    <IconButton
                                        size="small"
                                        onClick={handleClickActionOption(actionMenuOptions[0].value)}
                                        className={style.actionButton}
                                        style={{ color: actionMenuOptions[0].color }}
                                    >
                                        <ActionButtonIcon />
                                    </IconButton>
                                )}
                            </Aligner>
                        )}
                    </td>
                )}
                {Object.values(Z_TablePinOptions.enum).map((pinOption) => (
                    <Side side={pinOption} key={`${pinOption}_body_${index}`} />
                ))}
            </tr>
        </TableBodyContext.Provider>
    );
};

export default Row;
