import PaginationContext from "../../context/PaginationContext";
import { useState, useContext } from "react";
import PropsContext from "../../context/PropsContext";

interface PaginationProviderType {
    children: React.ReactNode;
}

const PaginationProvider = ({ children }: PaginationProviderType) => {
    const propsContext = useContext(PropsContext);
    const defaultPageSizeOptions = [10, 20, 50, 100];

    const [searchValue, setSearchValue] = useState("");

    const computedPageSizeOptions =
        propsContext.paginationConfig?.pageSizeOptions?.filter((sizeOption) => sizeOption > 0) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(computedPageSizeOptions[0] || defaultPageSizeOptions[0]);

    return (
        <PaginationContext.Provider
            value={{
                defaultPageSizeOptions,
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
