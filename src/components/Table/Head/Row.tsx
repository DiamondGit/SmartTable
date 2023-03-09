import { useRef, useContext, useEffect } from "react";
import StateContext from "../../../context/StateContext";
import { Z_TablePinOptions } from "../../../types/enums";
import Side from "./Side";
import style from "../Table.module.scss";
import ConfigContext from "../../../context/ConfigContext";
import { ColumnPinType, ComputedRowLevelType } from "../../../types/general";
import TableHeadContext from "../../../context/TableHeadContext";
import DataContext from "../../../context/DataContext";
import { Checkbox, ConfigProvider as AntdConfigProvider } from "antd";
import Aligner from "../../Aligner";
import PropsContext from "../../../context/PropsContext";
import DataFetchContext from "../../../context/DataFetchContext";
import { ACTION_COLUMN_NAME } from "../../../constants/general";

type HeadRowType = {
    level: number;
    rowLevel: ComputedRowLevelType;
    addOrReplaceColumnPin: (targetColumn: ColumnPinType) => void;
};

const Row = ({ level, rowLevel, addOrReplaceColumnPin }: HeadRowType) => {
    const actionCellRef = useRef<HTMLTableCellElement>(null);
    const { hasLeftPin, hasActionColumn } = useContext(ConfigContext);
    const dataContext = useContext(DataContext);
    const stateContext = useContext(StateContext);
    const dataFetchContext = useContext(DataFetchContext);
    const rowRef = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        addOrReplaceColumnPin({
            namedDataIndex: ACTION_COLUMN_NAME,
            order: -1,
            mainOrder: -1,
            pin: Z_TablePinOptions.enum.LEFT,
            level: 0,
            width: actionCellRef.current?.getClientRects()[0].width || 0,
        });
    }, [actionCellRef.current?.getClientRects()[0].width]);

    const actionCellClasses = [style.actionCell];
    if (hasLeftPin) actionCellClasses.push(style.withLeftPin);

    const isAllChecked = dataContext.dataListToDelete.length === dataFetchContext.data.length;
    const isIndeterminate =
        dataContext.dataListToDelete.length !== 0 && dataContext.dataListToDelete.length < dataFetchContext.data.length;
    const handleChangeCheckbox = () => {
        if (isAllChecked) {
            dataContext.setDataListToDelete([]);
        } else {
            dataContext.setDataListToDelete(dataFetchContext.data.map((dataRow) => dataRow.id));
        }
    };

    return (
        <tr ref={rowRef} style={{ position: "relative", zIndex: "auto" }}>
            {level === 0 && hasActionColumn && !dataFetchContext.isDataError && (
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
