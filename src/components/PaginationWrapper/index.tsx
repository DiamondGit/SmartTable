import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Pagination as AntdPagination } from "antd";
import { useContext, useEffect, useState } from "react";
import FilterContext from "../../context/FilterContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { PaginationPositionType } from "../../types/enums";
import { PaginationConfigType, PaginationPositionSchema } from "../../types/general";
import Aligner from "../Aligner";
import FilterChips from "../FilterChips";
import PaginationProvider from "../Providers/PaginationProvider";
import style from "./PaginationWrapper.module.scss";

interface PaginationWrapperType {
    openFilterModal: () => void;
    children: React.ReactNode;
}

const PaginationWrapper = ({ openFilterModal, children }: PaginationWrapperType) => {
    const defaultPageSizeOptions = [10, 20, 50, 100];
    const filterContext = useContext(FilterContext);
    const stateContext = useContext(StateContext);
    const { paginationConfig = {} as PaginationConfigType, data } = useContext(PropsContext);

    const computedPageSizeOptions = paginationConfig.pageSizeOptions?.filter((sizeOption) => sizeOption > 0) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(computedPageSizeOptions[0] || defaultPageSizeOptions[0]);

    const computedPaginationConfig = {
        total: paginationConfig.singleData ? data.length : paginationConfig.dataComputedCount.totalItems,
        pageSize: pageSize,
        showTotal:
            paginationConfig.hideTotal === undefined
                ? (total: number, range: [number, number]) => `${range[0]}-${range[1]} из ${total}`
                : undefined,
        hideSizeChanger: paginationConfig.hideSizeChanger === undefined ? false : true,
        pageSizeOptions: computedPageSizeOptions.length > 0 ? computedPageSizeOptions : defaultPageSizeOptions,
        bottomPosition: PaginationPositionSchema.parse(paginationConfig.bottomPosition),
        hideTop: paginationConfig.hideTop || false,
        hideBottom: paginationConfig.hideBottom || false,
    };

    useEffect(() => {
        paginationConfig.getData?.(currentPage, pageSize);
    }, []);

    const handlePageChange = (newCurrentPage: number, newPageSize: number) => {
        const computedNewCurrentPage = newPageSize !== pageSize ? 1 : newCurrentPage;
        setCurrentPage(computedNewCurrentPage);
        setPageSize(newPageSize);
        paginationConfig.getData?.(
            computedNewCurrentPage,
            newPageSize,
            stateContext.sortingColumn,
            stateContext.sortingDirection
        );
    };

    const Pagination = ({ position }: { position?: PaginationPositionType }) => (
        <div className={`${style.paginationContainer} ${style[`position_${PaginationPositionSchema.parse(position)}`]}`}>
            <AntdPagination
                total={computedPaginationConfig.total}
                current={currentPage}
                onChange={handlePageChange}
                showTotal={computedPaginationConfig.showTotal}
                pageSize={computedPaginationConfig.pageSize}
                showSizeChanger={!computedPaginationConfig.hideSizeChanger}
                pageSizeOptions={computedPaginationConfig.pageSizeOptions}
                size={"small"}
                disabled={stateContext.isLoading}
                itemRender={(
                    _page: number,
                    type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
                    _element: React.ReactNode
                ) => {
                    if (type === "next")
                        return (
                            <Aligner style={{ height: "100%" }}>
                                <NavigateNextIcon />
                            </Aligner>
                        );
                    else if (type === "prev")
                        return (
                            <Aligner style={{ height: "100%" }}>
                                <NavigateBeforeIcon />
                            </Aligner>
                        );
                    return _element;
                }}
            />
        </div>
    );

    const hasData = data.length > 0;
    const visibleTopPagination = hasData && !computedPaginationConfig.hideTop;
    const visibleBottomPagination = hasData && !computedPaginationConfig.hideBottom;

    return (
        <PaginationProvider value={{ currentPage, pageSize }}>
            <div className={style.wrapper}>
                {(visibleTopPagination || filterContext.filtersList.length > 0) && !stateContext.isError && (
                    <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr max-content" }}>
                        <FilterChips openFilterModal={openFilterModal} />
                        {visibleTopPagination && <Pagination />}
                    </div>
                )}
                <div className={style.content}>{children}</div>
                {visibleBottomPagination && !stateContext.isError && (
                    <Pagination position={computedPaginationConfig.bottomPosition} />
                )}
            </div>
        </PaginationProvider>
    );
};

export default PaginationWrapper;
