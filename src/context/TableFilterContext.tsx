import { createContext } from "react";
import { TableFilterHighlightType, TableFilterItemType } from "../types/general";

interface TableFilterContextType {
    filtersList: TableFilterItemType[];
    setFiltersList: React.Dispatch<React.SetStateAction<TableFilterItemType[]>>;
    modalFiltersList: TableFilterItemType[];
    setModalFiltersList: React.Dispatch<React.SetStateAction<TableFilterItemType[]>>;
    modalFiltersChangesList: TableFilterItemType[];
    setModalFiltersChangesList: React.Dispatch<React.SetStateAction<TableFilterItemType[]>>;
    filterHighlight: TableFilterHighlightType;
    setFilterHighlight: React.Dispatch<React.SetStateAction<TableFilterHighlightType>>;
}

const TableFilterContext = createContext<TableFilterContextType>({} as TableFilterContextType);

export default TableFilterContext;
