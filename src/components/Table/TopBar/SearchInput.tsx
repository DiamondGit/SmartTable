import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Button, Input } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import DataFetchContext from "../../../context/DataFetchContext";
import FilterContext from "../../../context/FilterContext";
import PaginationContext from "../../../context/PaginationContext";
import { ColumnType, WithRequired } from "../../../types/general";
import style from "../Table.module.scss";

const iconStyle = {
    fontSize: 22,
};

interface OptionType {
    label: string;
    searchValue: string;
}

const SearchInput = ({ isError }: { isError: boolean }) => {
    const dataFetchContext = useContext(DataFetchContext);
    const configContext = useContext(ConfigContext);
    const dataContext = useContext(DataContext);
    const paginationContext = useContext(PaginationContext);
    const filterContext = useContext(FilterContext);

    const prevSearchValue = useRef(paginationContext.searchValue);

    const [isOpen, setOpen] = useState(false);

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

    const toggleOpen = () => {
        if (isOpen && paginationContext.searchValue) {
            paginationContext.setSearchValue("");
        }
        setOpen(!isOpen);
    };

    useEffect(() => {
        const hasChanged = prevSearchValue.current !== paginationContext.searchValue;
        prevSearchValue.current = paginationContext.searchValue;
        if (!dataContext.isCancelingDelete && hasChanged) {
            dataFetchContext.requestController?.cancel();

            let timeout = setTimeout(() => {
                dataFetchContext.getData(filterContext.queryProps);
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

    const searchBarClasses = [style.searchBar];
    if (isOpen) searchBarClasses.push(style.open);

    return (
        <div className={searchBarClasses.join(" ")}>
            <Button
                type="ghost"
                className={style.searchBtn}
                onClick={toggleOpen}
                icon={isOpen ? <SearchOffIcon sx={iconStyle} /> : <SearchIcon sx={iconStyle} />}
            />
            <div className={style.slider}>
                <Input
                    placeholder="Поиск"
                    value={paginationContext.searchValue}
                    onChange={handleChange}
                    disabled={isError}
                    allowClear
                />
            </div>
        </div>
    );
};

export default SearchInput;
