import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { ActionMenuType } from "../../types/general";
import Aligner from "../Aligner";
import style from "../Table/Table.module.scss";

const ActionMenu = ({
    actionMenuOptions,
    handleClickActionOption,
}: {
    actionMenuOptions: ActionMenuType;
    handleClickActionOption: (option: string) => () => void;
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (option?: string) => () => {
        if (option) {
            handleClickActionOption(option)();
        }
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton size="small" onClick={handleClick} className={style.actionButton}>
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
                {actionMenuOptions.map((option) => (
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
