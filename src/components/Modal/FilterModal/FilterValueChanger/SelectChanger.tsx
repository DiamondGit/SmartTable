import { Box, Chip, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useContext } from "react";
import FilterContext from "../../../../context/FilterContext";
import { TableFilterItemType } from "../../../../types/general";

const SelectChanger = ({ filter }: { filter: TableFilterItemType }) => {
    const filterContext = useContext(FilterContext);
    const currentFilter = filterContext.modalFiltersChangesList.find((filterItem) => filterItem.id === filter.id);
    const selectedOptions = currentFilter?.field ? currentFilter.value || [] : [];
    const options = ["zoo", "baseball", "kids", "mine", "largest", "father", "wealth"];

    const handleChange = (event: SelectChangeEvent<typeof selectedOptions>) => {
        const {
            target: { value },
        } = event;
        const result = typeof value === "string" ? value.split(",") : value;
        filterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            const currentFilter = prevFilters[filterItemIndex];
            if (typeof currentFilter.field === "string") {
                prevFilters[filterItemIndex] = {
                    ...currentFilter,
                    value: result.length > 0 ? result : null,
                };
            }
            return [...prevFilters];
        });
    };

    return (
        <div style={{ position: "relative" }}>
            <Select
                multiple
                disabled={!filter.isActive}
                size={"small"}
                value={selectedOptions}
                onChange={handleChange}
                renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value: any) => (
                            <Chip key={value} label={value.toUpperCase()} />
                        ))}
                    </Box>
                )}
                style={{
                    width: "100%",
                }}
            >
                {options.map((option, index) => (
                    <MenuItem key={option + index} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        </div>
    );
};

export default SelectChanger;
