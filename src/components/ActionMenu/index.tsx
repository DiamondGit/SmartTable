import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Aligner from "../Aligner";
import style from "../Table/Table.module.scss";
import { useState } from "react";

const ActionMenu = ({ dataRow }: { dataRow: { [key: string]: any } }) => {
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
                    <MenuItem key={option.text} onClick={handleClose(option.text)}>
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
