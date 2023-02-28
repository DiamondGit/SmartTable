import PaginationContext from "../../context/PaginationContext";
import { useState, useContext } from "react";
import PropsContext from "../../context/PropsContext";
import DataFetchContext from "../../context/DataFetchContext";

interface PaginationProviderType {
    children: React.ReactNode;
}

const PaginationProvider = ({ children }: PaginationProviderType) => {
    const dataFetchContext = useContext(DataFetchContext);
    const propsContext = useContext(PropsContext);

    const [searchValue, setSearchValue] = useState("");

    const computedPageSizeOptions =
        propsContext.paginationConfig?.pageSizeOptions?.filter((sizeOption) => sizeOption > 0) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(computedPageSizeOptions[0] || dataFetchContext.defaultPageSizeOptions[0]);

    return (
        <PaginationContext.Provider
            value={{
                computedPageSizeOptions,

                searchValue,
                setSearchValue,

                currentPage,
                setCurrentPage,
                
                pageSize,
                setPageSize,
            }}
        >
            {children}
        </PaginationContext.Provider>
    );
};

export default PaginationProvider;
