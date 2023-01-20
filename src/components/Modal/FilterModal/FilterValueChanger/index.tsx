import { useContext } from "react";
import ConfigContext from "../../../../context/ConfigContext";
import FilterContext from "../../../../context/FilterContext";
import { Z_TableFilterTypes } from "../../../../types/enums";
import { TableFilterItemType } from "../../../../types/general";
import DateChanger from "./DateChanger";
import SelectChanger from "./SelectChanger";
import SwitchChanger from "./SwitchChanger";
import TextChanger from "./TextChanger";

const FilterValueChanger = ({ filter }: { filter: TableFilterItemType }) => {
    const filterContext = useContext(FilterContext);
    const configContext = useContext(ConfigContext);
    const currentField = filterContext.modalFiltersChangesList.find((modalFilter) => modalFilter.id === filter.id)?.field;
    switch (configContext.defaultTableConfig?.table.find((column) => column.dataIndex === currentField)?.filterType) {
        case Z_TableFilterTypes.enum.SELECT:
            return <SelectChanger filter={filter} />;
        case Z_TableFilterTypes.enum.TEXT:
            return <TextChanger filter={filter} />;
        case Z_TableFilterTypes.enum.DATE:
            return <DateChanger filter={filter} />;
        case Z_TableFilterTypes.enum.BOOLEAN:
            return <SwitchChanger filter={filter} />;
        case Z_TableFilterTypes.enum.CONDITION:
            return <></>;
        default:
            return null;
    }
};

export default FilterValueChanger;
