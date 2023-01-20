import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Menu, MenuItem, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import StateContext from "../../../context/StateContext";
import { ColumnType, WithRequired } from "../../../types/general";
import Aligner from "../../Aligner";
import style from "../Table.module.scss";

const iconStyle = {
    fontSize: 22,
};

interface SearchInputType {
    loading?: boolean;
}

interface OptionType {
    label: string;
    searchValue: string;
}

const SearchInput = ({ loading = false }: SearchInputType) => {
    const stateContext = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const [isOpen, setOpen] = useState(false);
    const searchBarClasses = [style.searchBar];

    const computedColumns = (configContext.defaultTableConfig?.table.filter(
        (column) => column.dataIndex !== undefined
    ) || []) as WithRequired<ColumnType, "dataIndex">[];

    const searchOptions: OptionType[] =
        computedColumns.map((column) => ({
            label: column.title,
            searchValue: column.dataIndex,
        })) || [];
    searchOptions.unshift({
        label: "Все поля",
        searchValue: "",
    });

    const [searchOption, setSearchOption] = useState(searchOptions[0]);

    const toggleOpen = () => {
        if (!isOpen) {
            setOpen(true);
        } else {
            console.log("--- Search ---");
        }
    };

    useEffect(() => {
        if (!stateContext.isDataLoading) {
            let timeout = setTimeout(() => {
                console.log("--- Request ---", stateContext.searchValue);
            }, 400);

            return () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
            };
        }
    }, [stateContext.searchValue]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        stateContext.setSearchValue(event.target.value);
    };

    if (loading) searchBarClasses.push(style.loading);
    if (isOpen) searchBarClasses.push(style.open);

    const getLabel = () => {
        if (searchOption.searchValue === "") return "Поиск";
        return "Поиск по: " + searchOption.label;
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isOptionsOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionChange = (option?: OptionType) => () => {
        if (option) {
            setSearchOption(option);
        }
        setAnchorEl(null);
    };

    const closeSearch = () => {
        setOpen(false);
    };

    return (
        <div className={searchBarClasses.join(" ")}>
            <Aligner className={style.searchBtn} onClick={toggleOpen}>
                <SearchIcon sx={iconStyle} className={!isOpen && stateContext.searchValue !== "" ? style.activeIcon : ""} />
            </Aligner>
            <div className={style.slider}>
                <div className={style.inputContainer}>
                    <TextField
                        style={{ width: "100%" }}
                        label={getLabel()}
                        variant="standard"
                        value={stateContext.searchValue}
                        onChange={handleChange}
                        size={"small"}
                    />
                    <IconButton size={"small"} onClick={handleClick} disabled={loading}>
                        {isOptionsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton size={"small"} onClick={closeSearch} disabled={loading}>
                        <CloseIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={isOptionsOpen}
                        onClose={handleOptionChange()}
                        PaperProps={{
                            style: {
                                maxHeight: "180px",
                                width: "max-content",
                            },
                        }}
                    >
                        {searchOptions.map((option) => (
                            <MenuItem
                                key={option.searchValue}
                                disabled={searchOption.searchValue === option.searchValue}
                                onClick={handleOptionChange(option)}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            </div>
        </div>
    );
};

export default SearchInput;
