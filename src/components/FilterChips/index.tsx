import { Chip } from "@mui/material";
import { useContext } from "react";
import ConfigContext from "../../context/ConfigContext";
import FilterContext from "../../context/FilterContext";
import { Z_FilterHighlights } from "../../types/enums";
import { TableFilterItemType } from "../../types/general";
import Aligner from "../Aligner";
import style from "./FilterChips.module.scss";

interface FilterChipsType {
    openFilterModal: () => void;
}

interface FilterChipType {
    filter: TableFilterItemType;
    openFilterModal: () => void;
}

const FilterChip = ({ filter, openFilterModal }: FilterChipType) => {
    const configContext = useContext(ConfigContext);
    const filterContext = useContext(FilterContext);

    const getValue = () => {
        if (Array.isArray(filter.value)) return filter.value.join(", ");
        else if (typeof filter.value === "boolean") return "some";
        return filter.value;
    };

    const handleClick = () => {
        filterContext.setFilterHighlight(() => ({
            type: Z_FilterHighlights.enum.HIGHLIGHT,
            filterIds: [
                filter.id,
            ]
        }));
        openFilterModal();
    };

    const handleDelete = () => {
        console.log("--- Here ---");
        filterContext.setFiltersList((prevFilterList) =>
            [...prevFilterList].filter((tableFilter) => tableFilter.id !== filter.id)
        );
    };

    return (
        <Chip
            label={
                <div className={style.chip}>
                    <h6 className={style.title}>
                        {
                            configContext.defaultTableConfig?.table.find(
                                (columnConfig) => columnConfig.dataIndex === filter.field
                            )?.title
                        }
                        :
                    </h6>
                    <p className={style.body}>{getValue()}</p>
                </div>
            }
            onClick={handleClick}
            onDelete={handleDelete}
        />
    );
};

const FilterChips = ({ openFilterModal }: FilterChipsType) => {
    const filterContext = useContext(FilterContext);

    const activeFilters = filterContext.filtersList.filter((tableFilter) => tableFilter.isActive);
    const ordinaryFilters = activeFilters.filter((tableFilter) => !tableFilter.isExclusion);
    const exclusionFilters = activeFilters.filter((tableFilter) => tableFilter.isExclusion);

    return (
        <div className={style.chipsContainer}>
            <Aligner style={{ justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "column" }} gutter={12}>
                {
                    ordinaryFilters.length > 0 &&
                    <Aligner style={{ justifyContent: "flex-start", alignItems: "flex-start" }} gutter={12}>
                        {ordinaryFilters.map((filter) => (
                            <FilterChip filter={filter} openFilterModal={openFilterModal} />
                        ))}
                    </Aligner>
                }
                {exclusionFilters.length > 0 && (
                    <Aligner
                        style={{ justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "column" }}
                        gutter={4}
                    >
                        <h4>Исключить:</h4>
                        <Aligner style={{ justifyContent: "flex-start", alignItems: "flex-start" }} gutter={12}>
                            {exclusionFilters.map((filter) => (
                                <FilterChip filter={filter} openFilterModal={openFilterModal} />
                            ))}
                        </Aligner>
                    </Aligner>
                )}
            </Aligner>
        </div>
    );
};

export default FilterChips;
