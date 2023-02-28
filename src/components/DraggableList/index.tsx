import { useContext } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { FLAG } from "../../constants/general";
import ConfigContext from "../../context/ConfigContext";
import { ColumnType } from "../../types/general";
import style from "./DraggableList.module.scss";
import DraggableListItem from "./DraggableListItem";

const DraggableList = () => {
    const configContext = useContext(ConfigContext);

    if (!configContext.modalTableConfig) return null;
    const columns = configContext.modalTableConfig.table.filter((column) => column.title && column.dataIndex);

    const reorder = (list: ColumnType[], startIndex: number, endIndex: number): ColumnType[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = ({ destination, source }: DropResult) => {
        if (!destination) return;

        if (configContext.modalTableConfig) {
            const newItems = reorder(columns, source.index, destination.index);

            let index = 0;
            const computedConfig = [...configContext.modalTableConfig.table].map((initialColumn) => {
                if (
                    newItems.some(
                        (newColumn) =>
                            newColumn.title === initialColumn.title && newColumn.dataIndex === initialColumn.dataIndex
                    )
                ) {
                    return newItems[index++];
                }
                return initialColumn;
            });

            configContext.setModalTableConfig({
                ...configContext.modalTableConfig,
                table: computedConfig,
            });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list" ignoreContainerClipping>
                {(provided) => {
                    return (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={style.draggableList}>
                            {columns.map((column, index) => (
                                <DraggableListItem column={column} index={index} key={column[FLAG.namedDataIndex]} />
                            ))}
                            {provided.placeholder}
                        </div>
                    );
                }}
            </Droppable>
        </DragDropContext>
    );
};

export default DraggableList;
