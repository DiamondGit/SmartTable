import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../context/ConfigContext";
import StateContext from "../../context/StateContext";
import { formatDate } from "../../functions/global";
import { TableColumnType, TablePinOptions, Z_TableDataTypes, Z_TablePinOptions } from "../../types/general";
import Aligner from "../Aligner";
import style from "./Table.module.scss";

interface TableColumnWidth {
    dataIndex: string;
    pin: TablePinOptions;
    order: number;
    width: number;
}

const TableBody = ({
    data,
    selectedRows,
    setSelectedRows,
}: {
    data: any[];
    selectedRows: number[];
    setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
    const tableColumnWidths = useRef<TableColumnWidth[]>([]);
    const stateContext = useContext(StateContext);
    const { tableConfig } = useContext(ConfigContext);
    if (!tableConfig) return null;

    const updateTableColumnWidth = (tableColumnWidth: TableColumnWidth) => {
        let prevWidths = [...tableColumnWidths.current];
        if (prevWidths.some((prevWidth) => prevWidth.dataIndex === tableColumnWidth.dataIndex)) {
            prevWidths = prevWidths.filter((prevWidth) => prevWidth.dataIndex !== tableColumnWidth.dataIndex);
        }
        prevWidths.push(tableColumnWidth);

        tableColumnWidths.current = prevWidths;
    };

    const getPinSide = (pin: TablePinOptions): string => {
        if (pin === Z_TablePinOptions.enum.LEFT) return "left";
        return "right";
    };

    const getPinOffset = (pin: TablePinOptions, order: number): number => {
        return (
            tableColumnWidths.current
                .filter(
                    (tableColumnWidth) =>
                        tableColumnWidth.pin === pin &&
                        (pin === Z_TablePinOptions.enum.LEFT
                            ? tableColumnWidth.order < order
                            : tableColumnWidth.order > order)
                )
                .reduce((widthSum, columnWidth) => widthSum + columnWidth.width, 0) || 0
        );
    };

    const Row = ({ dataRow, index }: { dataRow: any; index: number }) => {
        const actionCellRef = useRef<HTMLTableCellElement>(null);
        const [isClicked, setClicked] = useState(selectedRows.includes(index));

        useEffect(() => {
            if (actionCellRef.current?.clientWidth) {
                stateContext.setActionCellWidth(actionCellRef.current?.clientWidth);
                updateTableColumnWidth({
                    dataIndex: "_actionCell_",
                    pin: Z_TablePinOptions.enum.LEFT,
                    order: -1,
                    width: actionCellRef.current?.clientWidth,
                });
            }
        }, [actionCellRef.current]);

        const toggleRowClick = (event: React.MouseEvent<HTMLElement>) => {
            if (event.ctrlKey) {
                setClicked((prevState) => !prevState);
                setSelectedRows((prevState) => {
                    if (prevState.includes(index)) return [...prevState].filter((prevIndexes) => prevIndexes !== index);
                    return [...prevState, index];
                });
            }
        };

        const options = [
            {
                Icon: ControlPointDuplicateIcon,
                text: "Создать на основе",
                color: "#7ABB6D",
            },
            {
                Icon: EditIcon,
                text: "Изменить",
                color: "#F5A225",
            },
            {
                Icon: DeleteOutlineIcon,
                text: "Удалить",
                color: "#FA6855",
            },
        ];

        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = (option?: string) => () => {
            if (option) {
                console.log(option, dataRow);
            }
            setAnchorEl(null);
        };

        const getColumnClasses = (column: TableColumnType): string[] => {
            let columnClasses: string[] = [];

            if (stateContext.sortingColumn === column.dataIndex) columnClasses.push(style.sortColumn);
            if (column.pin !== Z_TablePinOptions.enum.NONE) columnClasses.push(style.pin);

            if (column.dataType === Z_TableDataTypes.enum.NUMBER) columnClasses.push(style.numericField);
            if (column.dataType !== Z_TableDataTypes.enum.STRING && column.dataType !== Z_TableDataTypes.enum.NUMBER)
                columnClasses.push(style.centeredField);

            return columnClasses;
        };

        const Cell = ({ column, order }: { column: TableColumnType; order: number }) => {
            const cellRef = useRef<HTMLTableCellElement>(null);
            const isPinned = column.pin !== Z_TablePinOptions.enum.NONE;
            const isLeftPin = column.pin === Z_TablePinOptions.enum.LEFT;
            const leftPinsCount = tableColumnWidths.current.filter(
                (tableColumnWidth) => tableColumnWidth.pin === Z_TablePinOptions.enum.LEFT
            ).length;

            useEffect(() => {
                updateTableColumnWidth({
                    dataIndex: column.dataIndex,
                    pin: column.pin,
                    order: order,
                    width: cellRef.current?.clientWidth || 0,
                });
            }, [cellRef.current]);

            const columnStyle = {
                ...(isPinned
                    ? {
                          [getPinSide(column.pin)]:
                              getPinOffset(column.pin, order) + (isLeftPin ? order : leftPinsCount - order),
                      }
                    : {}),
            };

            let field = dataRow[column.dataIndex];

            if (column.dataType === Z_TableDataTypes.enum.DATE) field = formatDate(field);

            return (
                <td
                    ref={cellRef}
                    key={`tableBody_${index}_${column.dataIndex}`}
                    className={getColumnClasses(column).join(" ")}
                    style={columnStyle}
                >
                    {field}
                </td>
            );
        };

        const SideColumns = ({ pinOption = Z_TablePinOptions.enum.NONE }: { pinOption?: TablePinOptions }) => {
            return (
                <>
                    {tableConfig.table
                        .filter((column) => (!column.hidable || column.visible) && column.pin === pinOption)
                        .map((column, index) => (
                            <Cell column={column} order={index} key={index} />
                        ))}
                </>
            );
        };

        const hasLeftPin = tableConfig.table.some((column) => column.pin === Z_TablePinOptions.enum.LEFT);

        return (
            <tr className={`${isClicked ? style.selected : ""}`} onClick={toggleRowClick}>
                <td
                    className={style.actionCell}
                    style={hasLeftPin ? { position: "sticky", left: 0 } : {}}
                    ref={actionCellRef}
                >
                    <Aligner>
                        <IconButton size={"small"} onClick={handleClick} className={style.actionButton}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose()}
                            PaperProps={{
                                style: {
                                    maxHeight: "180px",
                                    width: "max-content",
                                },
                            }}
                        >
                            {options.map((option) => (
                                <MenuItem key={option.text} onClick={handleClose(option.text)}>
                                    <Aligner style={{ justifyContent: "flex-start" }} gutter={12}>
                                        <option.Icon style={{ color: option.color }} />
                                        {option.text}
                                    </Aligner>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Aligner>
                </td>
                <SideColumns pinOption={Z_TablePinOptions.enum.LEFT} />
                <SideColumns />
                <SideColumns pinOption={Z_TablePinOptions.enum.RIGHT} />
            </tr>
        );
    };

    return (
        <>
            {data.length > 0 ? (
                data.map((dataRow) => <Row dataRow={dataRow} key={dataRow.id} index={dataRow.id} />)
            ) : (
                <tr>
                    <td
                        colSpan={tableConfig.table.length}
                        style={{
                            padding: 0,
                        }}
                    >
                        <Aligner
                            style={{
                                padding: "40px 0",
                                backgroundColor: "rgb(248, 248, 248)",
                            }}
                        >
                            <Aligner className={style.emptyBoxImg}>
                                <span className={style.label}>Нет данных</span>
                            </Aligner>
                        </Aligner>
                    </td>
                </tr>
            )}
        </>
    );
};

export default TableBody;
