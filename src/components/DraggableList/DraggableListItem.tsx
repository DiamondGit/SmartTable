import DragHandleIcon from "@mui/icons-material/DragHandle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useContext } from "react";
import { Draggable } from "react-beautiful-dnd";
import TableConfigContext from "../../context/TableConfigContext";
import TableUIContext from "../../context/TableUIContext";
import { TableColumnType } from "../../types/general";
import Aligner from "../Aligner";
import style from "./DraggableList.module.scss";

type DraggableListItemProps = {
    item: TableColumnType;
    index: number;
};

const DraggableListItem = ({ item, index }: DraggableListItemProps) => {
    const UI = useContext(TableUIContext);
    const tableConfigContext = useContext(TableConfigContext);

    const setVisibleTableColumn = (dataIndex: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        tableConfigContext.setTableConfig({
            ...tableConfigContext.tableConfig,
            table: [...tableConfigContext.tableConfig.table].map((column) =>
                column.dataIndex === dataIndex ? { ...column, visible: event.target.checked } : column
            ),
        });
    };

    return (
        <div className={style.draggableContainer}>
            <Draggable draggableId={item.dataIndex} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${style.listItem} ${
                            snapshot.isDragging && !snapshot.isDropAnimating ? style.dragging : ""
                        }`}
                    >
                        <Aligner style={{ width: "100%", justifyContent: "space-between" }}>
                            <Aligner style={{ justifyContent: "flex-start", marginLeft: item.hidable ? "0px" : "51px" }} gutter={12}>
                                {
                                    item.hidable &&
                                    <UI.Checkbox
                                        checked={item.visible}
                                        onChange={setVisibleTableColumn(item.dataIndex)}
                                    />
                                }
                                {item.title}
                            </Aligner>
                            <Aligner style={{ justifyContent: "flex-end" }} gutter={8}>
                                <UI.SecondaryBtn>
                                    <PushPinIcon />
                                </UI.SecondaryBtn>
                                <UI.SecondaryBtn>
                                    <LightbulbIcon />
                                </UI.SecondaryBtn>
                                <DragHandleIcon />
                            </Aligner>
                        </Aligner>
                    </div>
                )}
            </Draggable>
        </div>
    );
};

export default DraggableListItem;
