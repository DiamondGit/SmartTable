import { useContext, useRef, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import StateContext from "../../../context/StateContext";
import TableBodyContext from "../../../context/TableBodyContext";
import { Z_TablePinOptions } from "../../../types/enums";
import ActionMenu from "../../ActionMenu";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";
import Side from "./Side";

const Row = ({ dataRow, index }: { dataRow: any; index: number }) => {
    const stateContext = useContext(StateContext);
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const { hasLeftPin } = useContext(ConfigContext);
    const [isClicked, setClicked] = useState(stateContext.selectedRows.includes(index));

    const toggleRowClick = (event: React.MouseEvent<HTMLElement>) => {
        if (event.ctrlKey) {
            setClicked((prevState) => !prevState);
            stateContext.setSelectedRows((prevState) => {
                if (prevState.includes(index)) return [...prevState].filter((prevIndexes) => prevIndexes !== index);
                return [...prevState, index];
            });
        }
    };

    return (
        <TableBodyContext.Provider
            value={{
                dataRow,
                index,
            }}
        >
            <tr className={`${isClicked ? style.selected : ""}`} onClick={toggleRowClick}>
                <td
                    className={style.actionCell}
                    style={hasLeftPin ? { position: "sticky", left: 0 } : {}}
                    ref={actionCellRef}
                >
                    <Aligner>
                        <ActionMenu dataRow={dataRow} />
                    </Aligner>
                </td>
                <Side side={Z_TablePinOptions.enum.LEFT} />
                <Side />
                <Side side={Z_TablePinOptions.enum.RIGHT} />
            </tr>
        </TableBodyContext.Provider>
    );
};

export default Row;
