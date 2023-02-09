import { useRef, useContext, useEffect } from "react";
import StateContext from "../../../context/StateContext";
import { Z_TablePinOptions } from "../../../types/enums";
import Side from "./Side";
import style from "../Table.module.scss";
import ConfigContext from "../../../context/ConfigContext";
import { ComputedRowLevelType } from "../../../types/general";
import TableHeadContext from "../../../context/TableHeadContext";

type HeadRowType = {
    level: number;
    rowLevel: ComputedRowLevelType;
    actionCellRef: React.RefObject<HTMLTableCellElement>;
};

const Row = ({ level, rowLevel, actionCellRef }: HeadRowType) => {
    const { hasLeftPin } = useContext(ConfigContext);
    const stateContext = useContext(StateContext);
    const rowRef = useRef<HTMLTableRowElement>(null);

    const actionCellClasses = [style.actionCell];
    if (hasLeftPin) actionCellClasses.push(style.withLeftPin);
    return (
        <tr ref={rowRef} style={{ position: "relative", zIndex: "auto" }}>
            {level === 0 && (
                <th className={actionCellClasses.join(" ")} ref={actionCellRef} rowSpan={stateContext.maxHeadingDepth}></th>
            )}
            {Object.values(Z_TablePinOptions.enum).map((pinOption) => (
                <Side side={pinOption} columns={rowLevel[pinOption]} key={`${pinOption}_head_${level}`} />
            ))}
        </tr>
    );
};

export default Row;
