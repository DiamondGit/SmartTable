import { TextField } from "@mui/material";
import { useContext } from "react";
import TableFilterContext from "../../../context/TableFilterContext";
import { TableFilterItemType } from "../../../types/general";

const DateChanger = ({ filter }: { filter: TableFilterItemType }) => {
    const tableFilterContext = useContext(TableFilterContext);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { value },
        } = event;
        tableFilterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            const currentFilter = prevFilters[filterItemIndex];
            if (typeof currentFilter.field === "string") {
                prevFilters[filterItemIndex] = {
                    ...currentFilter,
                    value: value.length > 0 ? value : null,
                };
            }
            return [...prevFilters];
        });
    };

    return (
        <TextField
            type={"date"}
            size={"small"}
            disabled={!filter.isActive}
            value={filter.field ? filter.value : ""}
            onChange={handleChange}
            style={{
                width: "100%",
            }}
        />
    );
};

export default DateChanger;
