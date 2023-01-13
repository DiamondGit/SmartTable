import { Switch } from "@mui/material";
import { useContext, useEffect } from "react";
import FilterContext from "../../../../context/FilterContext";
import { TableFilterItemType } from "../../../../types/general";
import Aligner from "../../../Aligner";

const SwitchChanger = ({ filter }: { filter: TableFilterItemType }) => {
    const filterContext = useContext(FilterContext);

    useEffect(() => {
        filterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            const currentFilter = prevFilters[filterItemIndex];
            if (typeof currentFilter.field === "string") {
                prevFilters[filterItemIndex] = {
                    ...currentFilter,
                    value: false,
                };
            }
            return [...prevFilters];
        });
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { checked },
        } = event;
        filterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            const currentFilter = prevFilters[filterItemIndex];
            if (typeof currentFilter.field === "string") {
                prevFilters[filterItemIndex] = {
                    ...currentFilter,
                    value: checked,
                };
            }
            return [...prevFilters];
        });
    };

    const isChecked = Boolean(filter.value);

    return (
        <Aligner style={{ flexWrap: "nowrap", justifyContent: "space-between" }}>
            <span style={{ opacity: !isChecked ? "1" : "0.5" }}>Статус 1</span>
            <Switch size={"small"} disabled={!filter.isActive} checked={isChecked} onChange={handleChange} />
            <span style={{ opacity: isChecked ? "1" : "0.5" }}>Статус 2</span>
        </Aligner>
    );
};

export default SwitchChanger;
