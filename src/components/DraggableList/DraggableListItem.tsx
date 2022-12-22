import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useContext, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import TableConfigContext from "../../context/TableConfigContext";
import TableUIContext from "../../context/TableUIContext";
import { TableColumnType, TablePinOptions, Z_TablePinOptions } from "../../types/general";
import Aligner from "../Aligner";
import style from "./DraggableList.module.scss";

type DraggableListItemProps = {
    column: TableColumnType;
    index: number;
};

const DraggableListItem = ({ column, index }: DraggableListItemProps) => {
    const [isDragDisabled, setDragDisabled] = useState(false);
    const UI = useContext(TableUIContext);
    const tableConfigContext = useContext(TableConfigContext);

    const setVisibleTableColumn = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (tableConfigContext.tableConfig) {
            tableConfigContext.setTableConfig({
                ...tableConfigContext.tableConfig,
                table: [...tableConfigContext.tableConfig.table].map((targetColumn) =>
                    targetColumn.dataIndex === column.dataIndex
                        ? { ...targetColumn, visible: event.target.checked }
                        : targetColumn
                ),
            });
        }
    };

    const toggleColumnPin = () => {
        const switchPin = (currentPin: TablePinOptions): TablePinOptions => {
            switch (currentPin) {
                case Z_TablePinOptions.enum.NONE:
                    return Z_TablePinOptions.enum.LEFT;
                case Z_TablePinOptions.enum.LEFT:
                    return Z_TablePinOptions.enum.RIGHT;
                default:
                    return Z_TablePinOptions.enum.NONE;
            }
        };

        if (tableConfigContext.tableConfig) {
            tableConfigContext.setTableConfig({
                ...tableConfigContext.tableConfig,
                table: [...tableConfigContext.tableConfig.table].map((targetColumn) =>
                    targetColumn.dataIndex === column.dataIndex
                        ? { ...targetColumn, pin: switchPin(targetColumn.pin) }
                        : targetColumn
                ),
            });
        }
    };

    const toggleHighlight = () => {
        if (tableConfigContext.tableConfig) {
            tableConfigContext.setTableConfig({
                ...tableConfigContext.tableConfig,
                table: [...tableConfigContext.tableConfig.table].map((targetColumn) =>
                    targetColumn.dataIndex === column.dataIndex
                        ? { ...targetColumn, highlighted: !targetColumn.highlighted }
                        : targetColumn
                ),
            });
        }
    };

    //BUTTON CLASSES
    const btnClass = style.btn;
    const pinBtnClasses = [btnClass, style.pinBtn];
    const highlightBtnClasses = [btnClass, style.highlightBtn];

    //PIN BUTTON CLASSES
    const isPinnedLeft = column.pin === Z_TablePinOptions.enum.LEFT;
    const isPinnedRight = column.pin === Z_TablePinOptions.enum.RIGHT;

    const pinArrowClass = style.arrowIcon;
    const leftPinArrowClasses = [pinArrowClass, style.left];
    const rightPinArrowClasses = [pinArrowClass, style.right];

    if (isPinnedLeft) leftPinArrowClasses.push(style.active);
    if (isPinnedRight) rightPinArrowClasses.push(style.active);

    const pinClasses = [style.pinIcon];

    if (isPinnedLeft || isPinnedRight) pinClasses.push(style.active);

    //HIGHLIGHT BUTTON CLASSES
    const highlightClasses = [style.highlight];
    if (column.highlighted) highlightClasses.push(style.active);

    return (
        <div className={style.draggableContainer}>
            <Draggable draggableId={column.dataIndex} index={index} isDragDisabled={isDragDisabled}>
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
                            <Aligner style={{ justifyContent: "flex-start" }} gutter={12}>
                                <UI.Checkbox
                                    checked={column.visible}
                                    onChange={setVisibleTableColumn}
                                    disabled={!column.hidable}
                                />
                                {column.title}
                            </Aligner>
                            <Aligner style={{ justifyContent: "flex-end" }} gutter={16}>
                                <Aligner
                                    style={{ justifyContent: "flex-end" }}
                                    gutter={16}
                                    onMouseEnter={() => {
                                        setDragDisabled(true);
                                    }}
                                    onMouseLeave={() => {
                                        setDragDisabled(false);
                                    }}
                                >
                                    <UI.SecondaryBtn onClick={toggleColumnPin} className={pinBtnClasses.join(" ")}>
                                        {isPinnedLeft && <ArrowLeftIcon className={leftPinArrowClasses.join(" ")} />}
                                        <PushPinIcon className={pinClasses.join(" ")} />
                                        {isPinnedRight && <ArrowRightIcon className={rightPinArrowClasses.join(" ")} />}
                                    </UI.SecondaryBtn>
                                    <UI.SecondaryBtn onClick={toggleHighlight} className={highlightBtnClasses.join(" ")}>
                                        <LightbulbIcon className={highlightClasses.join(" ")} />
                                    </UI.SecondaryBtn>
                                </Aligner>
                                <DragHandleIcon className={style.dragIcon} />
                            </Aligner>
                        </Aligner>
                    </div>
                )}
            </Draggable>
        </div>
    );
};

export default DraggableListItem;
