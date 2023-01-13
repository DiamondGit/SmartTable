import { useContext } from "react";
import FilterContext from "../../../context/FilterContext";
import UIContext from "../../../context/UIContext";
import Aligner from "../../Aligner";

const FiltersResetter = () => {
    const filterContext = useContext(FilterContext);
    const UI = useContext(UIContext);

    const resetFilters = () => {
        filterContext.setModalFiltersList([...filterContext.filtersList]);
        filterContext.setModalFiltersChangesList([...filterContext.filtersList]);
    };

    const resetHardFilters = () => {
        filterContext.setModalFiltersList([]);
        filterContext.setModalFiltersChangesList([]);
    };

    const isTableDefaultFilters = JSON.stringify(filterContext.filtersList) === JSON.stringify([]);
    const isDefaultFilters = JSON.stringify(filterContext.modalFiltersChangesList) === JSON.stringify([]);
    const isTableFilters =
        JSON.stringify(filterContext.modalFiltersChangesList) === JSON.stringify(filterContext.filtersList);

    if (!((!isDefaultFilters && !isTableDefaultFilters) || !isTableFilters)) return null;
    return (
        <Aligner style={{ alignItems: "flex-end" }} isVertical gutter={8}>
            <Aligner style={{ justifyContent: "flex-start" }} gutter={4}>
                Сбросить:
            </Aligner>
            <Aligner gutter={8}>
                {!isDefaultFilters && !isTableDefaultFilters && (
                    <UI.SecondaryBtn onClick={resetHardFilters}>
                        <Aligner gutter={6}>
                            <span>По умолчанию</span>
                        </Aligner>
                    </UI.SecondaryBtn>
                )}
                {!isTableFilters && (
                    <UI.SecondaryBtn onClick={resetFilters}>
                        <Aligner gutter={6}>
                            <span>По текущей таблице</span>
                        </Aligner>
                    </UI.SecondaryBtn>
                )}
            </Aligner>
        </Aligner>
    );
};

export default FiltersResetter;
