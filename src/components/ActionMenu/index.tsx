import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Aligner from "../Aligner";
import style from "../Table/Table.module.scss";
import { useState, useContext } from "react";
import { GeneralObject } from "../../types/general";
import { Z_ModalTypes } from "../../types/enums";
import DataContext from "../../context/DataContext";

const ActionMenu = ({ dataRow }: { dataRow: GeneralObject }) => {
    const dataContext = useContext(DataContext);

    const deleteOption = "Delete";

    const options = [
        {
            Icon: ControlPointDuplicateIcon,
            text: "Создать на основе",
            value: Z_ModalTypes.enum.ADD_BASED,
            color: "#7ABB6D",
        },
        {
            Icon: EditIcon,
            text: "Изменить",
            value: Z_ModalTypes.enum.EDIT,
            color: "#F5A225",
        },
        {
            Icon: DeleteOutlineIcon,
            text: "Удалить",
            value: deleteOption,
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
            if (option === Z_ModalTypes.enum.ADD_BASED || option === Z_ModalTypes.enum.EDIT) {
                dataContext.openDataModal(option, dataRow);
            } else if (option === deleteOption) {
                dataContext.setSelectingToDelete(true);
                dataContext.setDataListToDelete((prevList) => [...prevList, dataRow.id]);
            }
        }
        setAnchorEl(null);
    };

    return (
        <>
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
                    <MenuItem key={option.text} onClick={handleClose(option.value)}>
                        <Aligner style={{ justifyContent: "flex-start" }} gutter={12}>
                            <option.Icon style={{ color: option.color }} />
                            {option.text}
                        </Aligner>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default ActionMenu;
