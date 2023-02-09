import PaginationContext, { PaginationContextType } from "../../context/PaginationContext";

interface PaginationProviderType {
    value: PaginationContextType;
    children: React.ReactNode;
}

const PaginationProvider = ({value, children}: PaginationProviderType) => {
    return (
        <PaginationContext.Provider value={value}>
            {children}
        </PaginationContext.Provider>
    )
}

export default PaginationProvider;