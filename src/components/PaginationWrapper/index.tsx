import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Pagination as AntdPagination } from "antd";
import { useContext, useEffect } from "react";
import FilterContext from "../../context/FilterContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { PaginationPositionType } from "../../types/enums";
import { PaginationConfigType, PaginationPositionSchema } from "../../types/general";
import Aligner from "../Aligner";
import FilterChips from "../FilterChips";
import style from "./PaginationWrapper.module.scss";

interface PaginationWrapperType {
    total: number;
    current: number;
    handlePageChange: (newPage: number) => void;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    openFilterModal: () => void;
    children: React.ReactNode;
}

const PaginationWrapper = ({
    total,
    current,
    handlePageChange = () => {},
    pageSize,
    setPageSize,
    openFilterModal,
    children,
}: PaginationWrapperType) => {
    const filterContext = useContext(FilterContext);
    const defaultPageSizeOptions = [10, 20, 50, 100];
    const stateContext = useContext(StateContext);
    const { paginationConfig = {} as PaginationConfigType } = useContext(PropsContext);

    const computedPaginationConfig = {
        pageSize: pageSize || paginationConfig.pageSizeOptions?.[0] || defaultPageSizeOptions[0],
        showTotal: paginationConfig.showTotal
            ? (total: number, range: [number, number]) => `${range[0]}-${range[1]} из ${total}`
            : undefined,
        showSizeChanger: paginationConfig.showSizeChanger || false,
        pageSizeOptions: paginationConfig.pageSizeOptions || defaultPageSizeOptions,
        bottomPosition: PaginationPositionSchema.parse(paginationConfig.bottomPosition),
        hideTop: paginationConfig.hideTop || false,
        hideBottom: paginationConfig.hideBottom || false,
    };

    useEffect(() => {
        setPageSize(computedPaginationConfig.pageSize);
    }, []);

    const handlePageSizeChange = (currentPage: number, newSize: number) => {
        setPageSize(newSize);
    };

    const Pagination = ({ position }: { position?: PaginationPositionType }) => (
        <div className={`${style.paginationContainer} ${style[`position_${PaginationPositionSchema.parse(position)}`]}`}>
            <AntdPagination
                total={total}
                current={current}
                onChange={handlePageChange}
                onShowSizeChange={handlePageSizeChange}
                showTotal={computedPaginationConfig.showTotal}
                pageSize={computedPaginationConfig.pageSize}
                showSizeChanger={computedPaginationConfig.showSizeChanger}
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

    const hasData = !!total;
    const visibleTopPagination = hasData && !computedPaginationConfig.hideTop;
    const visibleBottomPagination = hasData && !computedPaginationConfig.hideBottom;

    return (
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
    );
};

export default PaginationWrapper;
