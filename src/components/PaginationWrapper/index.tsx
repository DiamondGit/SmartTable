import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Pagination as AntdPagination } from "antd";
import { useContext, useEffect, useState } from "react";
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
    const paginationContext = useContext(PaginationContext);
    const filterContext = useContext(FilterContext);
    const stateContext = useContext(StateContext);
    const { paginationConfig = {} as PaginationConfigType, data } = useContext(PropsContext);

    const computedPaginationConfig = {
        total: paginationConfig.singleData ? data.length : paginationConfig.dataComputedCount.totalItems,
        pageSize: paginationContext.pageSize,
        showTotal:
            paginationConfig.hideTotal === undefined
                ? (total: number, range: [number, number]) => `${range[0]}-${range[1]} из ${total}`
                : undefined,
        hideSizeChanger: paginationConfig.hideSizeChanger === undefined ? false : true,
        pageSizeOptions:
            paginationContext.computedPageSizeOptions.length > 0
                ? paginationContext.computedPageSizeOptions
                : paginationContext.defaultPageSizeOptions,
        bottomPosition: PaginationPositionSchema.parse(paginationConfig.bottomPosition),
        hideTop: paginationConfig.hideTop || false,
        hideBottom: paginationConfig.hideBottom || false,
    };

    const handlePageChange = (newCurrentPage: number, newPageSize: number) => {
        const computedNewCurrentPage = newPageSize !== paginationContext.pageSize ? 1 : newCurrentPage;
        paginationContext.setCurrentPage(computedNewCurrentPage);
        paginationContext.setPageSize(newPageSize);
        paginationConfig.getData?.({
            ...filterContext.queryProps,
            currentPage: computedNewCurrentPage,
            pageSize: newPageSize,
        });
    };

    const Pagination = ({ position }: { position?: PaginationPositionType }) => (
        <div className={`${style.paginationContainer} ${style[`position_${PaginationPositionSchema.parse(position)}`]}`}>
            <AntdPagination
                total={computedPaginationConfig.total}
                current={paginationContext.currentPage}
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
        <div className={style.wrapper}>
            {visibleTopPagination && !stateContext.isError && (
                <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr max-content" }}>
                    {visibleTopPagination && <Pagination />}
                </div>
            )}
            <div className={style.content}>{children}</div>
            {visibleBottomPagination && !stateContext.isError && (
                <Pagination position={computedPaginationConfig.bottomPosition} />
            )}
        </div>
    );
};

export default PaginationWrapper;
