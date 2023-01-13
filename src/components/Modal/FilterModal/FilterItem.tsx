import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox, IconButton, MenuItem, Select as MuiSelect, SelectChangeEvent, Switch } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import ConfigContext from "../../../context/ConfigContext";
import FilterContext from "../../../context/FilterContext";
import { TableColumnType, TableFilterItemType, Z_FilterHighlights, Z_TableFilterType } from "../../../types/general";
import Aligner from "../../Aligner";
import style from "./FilterModal.module.scss";
import FilterValueChanger from "./FilterValueChanger";

interface FilterItemType {
    filter: TableFilterItemType;
    order: number;
    deleteItem: (id: number) => void;
}

const FilterItem = ({ filter, order, deleteItem }: FilterItemType) => {
    const configContext = useContext(ConfigContext);
    const tableConfig = configContext.defaultTableConfig?.table;
    const filterContext = useContext(FilterContext);
    const [animationSwitcher, setAnimationSwitcher] = useState(0);

    const handleDelete = () => {
        deleteItem(filter.id);
    };

    filter = filterContext.modalFiltersChangesList.find((modalFilter) => modalFilter.id === filter.id) || filter;

    const filterableColumns: TableColumnType[] =
        tableConfig?.filter((column) => column.filterType !== Z_TableFilterType.enum.NONE) || [];

    const handleFilterColumnChange = (event: SelectChangeEvent) => {
        const newFilterColumn = event.target.value;
        filterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            prevFilters[filterItemIndex] = { ...prevFilters[filterItemIndex], field: newFilterColumn, value: null };
            return [...prevFilters];
        });
    };

    const toggleActive = (event: React.ChangeEvent<HTMLInputElement>) => {
        filterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            prevFilters[filterItemIndex] = { ...prevFilters[filterItemIndex], isActive: event.target.checked };
            return [...prevFilters];
        });
    };

    useEffect(() => {
        setAnimationSwitcher((prevAnimation) => prevAnimation + 1);
    }, [filterContext.filterHighlight]);

    const filterItemClasses = [style.filterItem];
    if (filter.isActive) filterItemClasses.push(style.active);
    if (filterContext.filterHighlight.filterIds.includes(filter.id)) {
        filterItemClasses.push(
            filterContext.filterHighlight.type === Z_FilterHighlights.enum.HIGHLIGHT ? style.highlight : style.warning
        );
        filterItemClasses.push(style[`highlighted_${animationSwitcher % 2}`]);
    }

    const computedOptions = filterableColumns.filter((filterableColumn) => {
        const defaultColumn = configContext.defaultTableConfig?.table.find(
            (column) => column.dataIndex === filterableColumn.dataIndex
        );

        return (
            defaultColumn?.filterType !== Z_TableFilterType.enum.BOOLEAN ||
            !filterContext.modalFiltersChangesList.some(
                (modalFilter) => modalFilter.field === defaultColumn.dataIndex && modalFilter.id !== filter.id
            )
        );
    });

    const toggleExclusion = (event: React.ChangeEvent<HTMLInputElement>) => {
        filterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            prevFilters[filterItemIndex] = { ...prevFilters[filterItemIndex], isExclusion: event.target.checked };
            return [...prevFilters];
        });
    };

    return (
        <tr className={filterItemClasses.join(" ")}>
            <td className={style.order}>{order}.</td>
            <td className={style.activeStatus}>
                <Checkbox checked={filter.isActive} onChange={toggleActive} />
            </td>
            <td className={style.columnSelect}>
                <MuiSelect
                    size={"small"}
                    value={filter.field}
                    style={{ width: "180px" }}
                    onChange={handleFilterColumnChange}
                    disabled={!filter.isActive}
                >
                    {computedOptions.map((column) => (
                        <MenuItem key={column.dataIndex} value={column.dataIndex}>
                            {column.title}
                        </MenuItem>
                    ))}
                </MuiSelect>
            </td>
            <td className={style.exclusion}>
                <Aligner>
                    <Switch disabled={!filter.isActive} onChange={toggleExclusion} checked={filter.isExclusion} />
                </Aligner>
            </td>
            <td className={style.filterValue}>
                <FilterValueChanger filter={filter} />
            </td>
            <td className={style.delete}>
                <IconButton size={"small"} onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </td>
        </tr>
    );
};

export default FilterItem;
