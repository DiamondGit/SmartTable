import { useRef, useContext, useEffect } from "react";
import StateContext from "../../../context/StateContext";
import { Z_TablePinOptions } from "../../../types/enums";
import Side from "./Side";
import style from "../Table.module.scss";
import ConfigContext from "../../../context/ConfigContext";
import { ComputedRowLevelType } from "../../../types/general";
import TableHeadContext from "../../../context/TableHeadContext";
import DataContext from "../../../context/DataContext";
import { Checkbox, ConfigProvider as AntdConfigProvider } from "antd";
import Aligner from "../../Aligner";
import PropsContext from "../../../context/PropsContext";

type HeadRowType = {
    level: number;
    rowLevel: ComputedRowLevelType;
    actionCellRef: React.RefObject<HTMLTableCellElement>;
};

const Row = ({ level, rowLevel, actionCellRef }: HeadRowType) => {
    const { hasLeftPin } = useContext(ConfigContext);
    const dataContext = useContext(DataContext);
    const stateContext = useContext(StateContext);
    const propsContext = useContext(PropsContext);
    const rowRef = useRef<HTMLTableRowElement>(null);

    const actionCellClasses = [style.actionCell];
    if (hasLeftPin) actionCellClasses.push(style.withLeftPin);

    const isAllChecked = dataContext.dataListToDelete.length === propsContext.data.length;
    const isIndeterminate =
        dataContext.dataListToDelete.length !== 0 && dataContext.dataListToDelete.length < propsContext.data.length;
    const handleChangeCheckbox = () => {
        if (isAllChecked) {
            dataContext.setDataListToDelete([]);
        } else {
            dataContext.setDataListToDelete(propsContext.data.map((dataRow) => dataRow.id));
        }
    };

    return (
        <tr ref={rowRef} style={{ position: "relative", zIndex: "auto" }}>
            {level === 0 && (
                <th className={actionCellClasses.join(" ")} ref={actionCellRef} rowSpan={stateContext.maxHeadingDepth}>
                    {dataContext.isSelectingToDelete && (
                        <Aligner>
                            <AntdConfigProvider
                                theme={{
                                    token: {
                                        colorPrimary: "#922",
                                    },
                                }}
                            >
                                <Checkbox
                                    indeterminate={isIndeterminate}
                                    onChange={handleChangeCheckbox}
                                    checked={isAllChecked}
                                    disabled={dataContext.isDeleting}
                                />
                            </AntdConfigProvider>
                        </Aligner>
                    )}
                </th>
            )}
            {Object.values(Z_TablePinOptions.enum).map((pinOption) => (
                <Side side={pinOption} columns={rowLevel[pinOption]} key={`${pinOption}_head_${level}`} />
            ))}
        </tr>
    );
};

export default Row;
