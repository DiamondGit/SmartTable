import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Menu, MenuItem, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import FilterContext from "../../../context/FilterContext";
import PaginationContext from "../../../context/PaginationContext";
import PropsContext from "../../../context/PropsContext";
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
    const propsContext = useContext(PropsContext);
    const configContext = useContext(ConfigContext);
    const dataContext = useContext(DataContext);
    const paginationContext = useContext(PaginationContext);
    const filterContext = useContext(FilterContext);

    const [isOpen, setOpen] = useState(false);
    const searchBarClasses = [style.searchBar];

    const computedColumns = (configContext.defaultTableConfig?.table.filter((column) => column.dataIndex !== undefined) ||
        []) as WithRequired<ColumnType, "dataIndex">[];

    const searchOptions: OptionType[] =
        computedColumns
            .filter((column) => !!column.title)
            .map((column) => ({
                label: column.title as string,
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
        }
    };

    useEffect(() => {
        if (!propsContext.isDataLoading && !dataContext.isCancelingDelete) {
            let timeout = setTimeout(() => {
                propsContext.paginationConfig?.getData?.(filterContext.queryProps);
            }, 400);

            return () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
            };
        }
        if (dataContext.isCancelingDelete) {
            dataContext.setCancelingDelete(false);
        }
    }, [paginationContext.searchValue]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        paginationContext.setSearchValue(event.target.value);
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
                <SearchIcon
                    sx={iconStyle}
                    className={!isOpen && paginationContext.searchValue !== "" ? style.activeIcon : ""}
                />
            </Aligner>
            <div className={style.slider}>
                <div className={style.inputContainer}>
                    <TextField
                        style={{ width: "100%" }}
                        label={getLabel()}
                        variant="standard"
                        value={paginationContext.searchValue}
                        onChange={handleChange}
                        size={"small"}
                        focused
                    />
                    {/* <IconButton size={"small"} onClick={handleClick} disabled={loading}>
                        {isOptionsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton> */}
                    <IconButton size={"small"} onClick={closeSearch} disabled={loading}>
                        <CloseIcon />
                    </IconButton>
                    {/* <Menu
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
                    </Menu> */}
                </div>
            </div>
        </div>
    );
};

export default SearchInput;
