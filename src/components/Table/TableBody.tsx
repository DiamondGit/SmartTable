import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useContext, useState } from "react";
import TableConfigContext from "../../context/TableConfigContext";
import Aligner from "../Aligner";
import style from "./Table.module.scss";
import ControlPointDuplicateIcon from '@mui/icons-material/ControlPointDuplicate';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const TableBody = ({
    data,
    selectedRows,
    setSelectedRows,
}: {
    data: any[];
    selectedRows: number[];
    setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
    const { tableConfig } = useContext(TableConfigContext);
    if (!tableConfig) return null;

    const Row = ({ dataRow, index }: { dataRow: any; index: number }) => {
        const [isClicked, setClicked] = useState(selectedRows.includes(index));

        const toggleRowClick = (event: React.MouseEvent<HTMLElement>) => {
            if (event.ctrlKey) {
                setClicked((prevState) => !prevState);
                setSelectedRows((prevState) => {
                    if (prevState.includes(index)) return [...prevState].filter(prevIndexes => prevIndexes !== index);
                    return [...prevState, index];
                });
            }
        };

        const options = [
            {
                Icon: ControlPointDuplicateIcon,
                text: "Создать на основе",
                color: "#7ABB6D"
            },
            {
                Icon: EditIcon,
                text: "Изменить",
                color: "#F5A225"
            },
            {
                Icon: DeleteOutlineIcon,
                text: "Удалить",
                color: "#FA6855"
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

        return (
            <tr className={`${isClicked ? style.clicked : ""}`} onClick={toggleRowClick}>
                <td className={style.actionCell}>
                    <div>
                        <IconButton
                            size={"small"}
                            onClick={handleClick}
                            className={style.actionButton}
                        >
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
                    </div>
                </td>
                {tableConfig.table
                    .filter((column) => !column.hidable || column.visible)
                    .map((column, i) => (
                        <td key={`tableBody_${index}_${column.dataIndex}`}>
                            <div
                                style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "12px" }}
                            >
                                {dataRow[column.dataIndex]}
                            </div>
                        </td>
                    ))}
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
                            <div className={style.emptyBoxImg}>
                                <span className={style.label}>Нет данных</span>
                            </div>
                        </Aligner>
                    </td>
                </tr>
            )}
        </>
    );
};

export default TableBody;
