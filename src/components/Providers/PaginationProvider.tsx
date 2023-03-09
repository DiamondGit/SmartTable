import { useContext, useState } from "react";
import DataFetchContext from "../../context/DataFetchContext";
import PaginationContext from "../../context/PaginationContext";
import PropsContext from "../../context/PropsContext";

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
