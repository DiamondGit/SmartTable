import { memo } from "react";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { TableColumnType } from "../../types/general";
import style from "./DraggableList.module.scss";
import DraggableListItem from "./DraggableListItem";

export type DraggableListProps = {
    columns: TableColumnType[];
    onDragEnd: OnDragEndResponder;
};

const DraggableList = memo(({ columns, onDragEnd }: DraggableListProps) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list" ignoreContainerClipping>
                {(provided) => {
                    return (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={style.draggableList}>
                            {columns.map((column, index) => (
                                <DraggableListItem column={column} index={index} key={column.dataIndex} />
                            ))}
                            {provided.placeholder}
                        </div>
                    );
                }}
            </Droppable>
        </DragDropContext>
    );
});

export default DraggableList;
