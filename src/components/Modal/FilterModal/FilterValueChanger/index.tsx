import { useContext } from "react";
import ConfigContext from "../../../../context/ConfigContext";
import FilterContext from "../../../../context/FilterContext";
import { TableFilterItemType, Z_TableFilterType } from "../../../../types/general";
import DateChanger from "./DateChanger";
import SelectChanger from "./SelectChanger";
import SwitchChanger from "./SwitchChanger";
import TextChanger from "./TextChanger";

const FilterValueChanger = ({ filter }: { filter: TableFilterItemType }) => {
    const filterContext = useContext(FilterContext);
    const configContext = useContext(ConfigContext);
    const currentField = filterContext.modalFiltersChangesList.find((modalFilter) => modalFilter.id === filter.id)?.field;
    switch (configContext.defaultTableConfig?.table.find((column) => column.dataIndex === currentField)?.filterType) {
        case Z_TableFilterType.enum.SELECT:
            return <SelectChanger filter={filter} />;
        case Z_TableFilterType.enum.TEXT:
            return <TextChanger filter={filter} />;
        case Z_TableFilterType.enum.DATE:
            return <DateChanger filter={filter} />;
        case Z_TableFilterType.enum.BOOLEAN:
            return <SwitchChanger filter={filter} />;
        case Z_TableFilterType.enum.CONDITION:
            return <></>;
        default:
            return null;
    }
};

export default FilterValueChanger;
