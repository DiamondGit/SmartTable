import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Pagination as AntdPagination } from "antd";
import { useContext } from "react";
import DataContext from "../../context/DataContext";
import DataFetchContext from "../../context/DataFetchContext";
import FilterContext from "../../context/FilterContext";
import PaginationContext from "../../context/PaginationContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { PaginationPositionType } from "../../types/enums";
import { PaginationConfigType, PaginationPositionSchema } from "../../types/general";
import Aligner from "../Aligner";
import style from "./PaginationWrapper.module.scss";

interface PaginationWrapperType {
    children: React.ReactNode;
}

const PaginationWrapper = ({ children }: PaginationWrapperType) => {
    const dataFetchContext = useContext(DataFetchContext);
    const paginationContext = useContext(PaginationContext);
    const filterContext = useContext(FilterContext);
    const stateContext = useContext(StateContext);
    const dataContext = useContext(DataContext);
    const { isFullscreen } = dataContext;
    const { paginationConfig = {} as PaginationConfigType } = useContext(PropsContext);

    const computedPaginationConfig = {
        total: dataFetchContext.isSingleData ? dataFetchContext.data.length : dataFetchContext.dataComputedCount.totalItems,
        pageSize: paginationContext.pageSize,
        showTotal:
            paginationConfig.hideTotal === undefined
                ? (total: number, range: [number, number]) => <span>{`${range[0]}-${range[1]} из ${total}`}</span>
                : undefined,
        hideSizeChanger: paginationConfig.hideSizeChanger === undefined ? false : true,
        pageSizeOptions:
            paginationContext.computedPageSizeOptions.length > 0
                ? paginationContext.computedPageSizeOptions
                : dataFetchContext.defaultPageSizeOptions,
        bottomPosition: PaginationPositionSchema.parse(paginationConfig.bottomPosition),
        hideTop: paginationConfig.hideTop || false,
        hideBottom: paginationConfig.hideBottom || false,
    };

    const handlePageChange = (newCurrentPage: number, newPageSize: number) => {
        const computedNewCurrentPage = newPageSize !== paginationContext.pageSize ? 1 : newCurrentPage;
        paginationContext.setCurrentPage(computedNewCurrentPage);
        paginationContext.setPageSize(newPageSize);
        if (!dataFetchContext.isSingleData) {
            dataFetchContext.getData({
                ...filterContext.queryProps,
                currentPage: computedNewCurrentPage,
                pageSize: newPageSize,
            });
        }
    };

    const Pagination = ({ position }: { position?: PaginationPositionType }) => {
        const paginationClasses = [style.paginationContainer, style[`position_${PaginationPositionSchema.parse(position)}`]];
        if (isFullscreen) paginationClasses.push(style.isFullscreen);
        return (
            <div className={paginationClasses.join(" ")}>
                <AntdPagination
                    total={computedPaginationConfig.total}
                    current={paginationContext.currentPage}
                    onChange={handlePageChange}
                    showTotal={computedPaginationConfig.showTotal}
                    pageSize={computedPaginationConfig.pageSize}
                    showSizeChanger={!computedPaginationConfig.hideSizeChanger}
                    pageSizeOptions={computedPaginationConfig.pageSizeOptions}
                    className={style.pagination}
                    size="small"
                    disabled={
                        stateContext.isDefaultConfigLoading ||
                        dataFetchContext.isDataLoading ||
                        dataContext.isSelectingToDelete
                    }
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
    };

    const hasData = dataFetchContext.data.length > 0;
    const isError = stateContext.isDefaultConfigLoadingError || dataFetchContext.isDataError;
    const visibleTopPagination = hasData && !computedPaginationConfig.hideTop;
    const visibleBottomPagination = hasData && !computedPaginationConfig.hideBottom;

    const wrapperClasses = [style.wrapper];
    if ((visibleTopPagination && !isError) || isFullscreen) wrapperClasses.push(style.withTopPagination);
    if (visibleBottomPagination && !isError && !isFullscreen) wrapperClasses.push(style.withButtomPagination);

    return (
        <div className={wrapperClasses.join(" ")}>
            {((visibleTopPagination && !isError) || isFullscreen) && <Pagination />}
            <div className={style.content}>{children}</div>
            {visibleBottomPagination && !isError && !isFullscreen && (
                <Pagination position={computedPaginationConfig.bottomPosition} />
            )}
        </div>
    );
};

export default PaginationWrapper;
