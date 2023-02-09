import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useContext, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { FLAG } from "../../constants/general";
import ConfigContext from "../../context/ConfigContext";
import StateContext from "../../context/StateContext";
import UIContext from "../../context/UIContext";
import { TablePinOptions, Z_SortOptions, Z_TablePinOptions } from "../../types/enums";
import { ColumnType } from "../../types/general";
import Aligner from "../Aligner";
import style from "./DraggableList.module.scss";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionDetails, { AccordionDetailsProps } from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type DraggableListItemProps = {
    column: ColumnType;
    index: number;
};

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
    ({ theme }) => ({
        width: "100%",
        border: "none",
        backgroundColor: "unset",
        "&:before": {
            display: "none",
        },
    })
);

const AccordionDetails = styled((props: AccordionDetailsProps) => <MuiAccordionDetails {...props} />)(({ theme }) => ({
    cursor: "default",
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => <MuiAccordionSummary {...props} />)(({ theme }) => ({
    padding: 0,
    cursor: "grab",
    minHeight: "unset",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-content": {
        margin: 0,
    },
}));

const DraggableListItem = ({ column, index }: DraggableListItemProps) => {
    const UI = useContext(UIContext);
    const configContext = useContext(ConfigContext);
    const stateContext = useContext(StateContext);
    const [accordionOpen, setAccordionOpen] = useState(false);

    const getComputedDataIndex = (targetColumn: ColumnType) => {
        return targetColumn.dataIndex || targetColumn[FLAG.namedDataIndex];
    };

    const computedDataIndex = getComputedDataIndex(column);

    const setVisibleTableColumn = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (configContext.modalTableConfig) {
            configContext.setModalTableConfig({
                ...configContext.modalTableConfig,
                table: [...configContext.modalTableConfig.table].map((targetColumn) =>
                    getComputedDataIndex(targetColumn) === computedDataIndex
                        ? { ...targetColumn, visible: event.target.checked }
                        : targetColumn
                ),
            });
        }
    };

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

    const pinWithSubcolumns = (targetColumn: ColumnType, pinOption: TablePinOptions) => {
        const result = { ...targetColumn, pin: pinOption };
        if (targetColumn.subcolumns) {
            let tempResult: ColumnType[] = [];
            targetColumn.subcolumns.forEach((subcolumn) => {
                tempResult = tempResult.concat(pinWithSubcolumns(subcolumn, pinOption));
            });

            return { ...result, subcolumns: tempResult };
        } else return result;
    };

    const toggleColumnPin = () => {
        if (configContext.modalTableConfig) {
            configContext.setModalTableConfig({
                ...configContext.modalTableConfig,
                table: [...configContext.modalTableConfig.table].map((targetColumn) => {
                    if (getComputedDataIndex(targetColumn) !== computedDataIndex) return targetColumn;
                    return pinWithSubcolumns(targetColumn, switchPin(targetColumn.pin));
                }),
            });
        }
    };

    const toggleHighlight = () => {
        if (configContext.modalTableConfig) {
            configContext.setModalTableConfig({
                ...configContext.modalTableConfig,
                table: [...configContext.modalTableConfig.table].map((targetColumn) =>
                    getComputedDataIndex(targetColumn) === computedDataIndex
                        ? { ...targetColumn, highlighted: !targetColumn.highlighted }
                        : targetColumn
                ),
            });
        }
    };

    const toggleAccordion = () => {
        setAccordionOpen((prev) => !prev);
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

    //HIGHLIGHT BUTTON CLASSES
    const dragItemClasses = [style.listItem];
    if (!column.visible) dragItemClasses.push(style.hiddenItem);

    if (!computedDataIndex) return null;

    const Content = ({ expandable = false }: { expandable?: boolean }) => (
        <Aligner style={{ width: "100%", justifyContent: "space-between" }}>
            <Aligner style={{ justifyContent: "flex-start" }} gutter={12}>
                <UI.Checkbox
                    checked={column.visible}
                    onChange={setVisibleTableColumn}
                    disabled={!column.hidable || stateContext.sortingColumn === computedDataIndex}
                />
                <span className={style.title}>{column.title}</span>
                <Aligner className={style.sortingArrow}>
                    {stateContext.sortingColumn === computedDataIndex && (
                        <>
                            {stateContext.sortingDirection === Z_SortOptions.enum.ASC ? (
                                <ArrowDownwardIcon className={style.activeIcon} style={{ fontSize: "20px" }} />
                            ) : (
                                <ArrowUpwardIcon className={style.activeIcon} style={{ fontSize: "20px" }} />
                            )}
                        </>
                    )}
                </Aligner>
            </Aligner>
            <Aligner style={{ justifyContent: "flex-end" }} gutter={16}>
                <Aligner
                    style={{ justifyContent: "flex-end" }}
                    gutter={16}
                >
                    {expandable && (
                        <UI.SecondaryBtn onClick={toggleAccordion}>
                            {accordionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </UI.SecondaryBtn>
                    )}
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
    );

    return (
        <div className={style.draggableContainer}>
            <Draggable draggableId={computedDataIndex} index={index}>
                {(provided, snapshot) => {
                    if (snapshot.isDragging && !snapshot.isDropAnimating) dragItemClasses.push(style.dragging);
                    return (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={dragItemClasses.join(" ")}
                        >
                            {column.subcolumns ? (
                                <Accordion expanded={accordionOpen}>
                                    <AccordionSummary>
                                        <Content expandable />
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {column.subcolumns.map((subcolumn) => (
                                            <p key={subcolumn.title}>{subcolumn.title}</p>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            ) : (
                                <Content />
                            )}
                        </div>
                    );
                }}
            </Draggable>
        </div>
    );
};

export default DraggableListItem;
