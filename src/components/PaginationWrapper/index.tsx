import { Pagination as AntdPagination } from "antd";
import { PaginationConfigType, PaginationPositionParser, PaginationPositionType } from "../../types/general";
import style from "./PaginationWrapper.module.scss";
import { useEffect, useContext } from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Aligner from "../Aligner";
import FilterChips from "../FilterChips";
import TableFilterContext from "../../context/TableFilterContext";

interface PaginationWrapperType {
    total: number;
    current: number;
    handlePageChange: (newPage: number) => void;
    paginationConfig?: PaginationConfigType;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    disabled: boolean;
    openFilterModal: () => void;
    children: React.ReactNode;
}

const PaginationWrapper = ({
    total,
    current,
    handlePageChange = () => {},
    paginationConfig = {} as PaginationConfigType,
    pageSize,
    setPageSize,
    disabled,
    openFilterModal,
    children,
}: PaginationWrapperType) => {
    const tableFilterContext = useContext(TableFilterContext);
    const defaultPageSizeOptions = [10, 20, 50, 100];

    const computedPaginationConfig = {
        pageSize: pageSize || paginationConfig.pageSizeOptions?.[0] || defaultPageSizeOptions[0],
        showTotal: paginationConfig.showTotal
            ? (total: number, range: [number, number]) => `${range[0]}-${range[1]} из ${total}`
            : undefined,
        showSizeChanger: paginationConfig.showSizeChanger || false,
        pageSizeOptions: paginationConfig.pageSizeOptions || defaultPageSizeOptions,
        bottomPosition: PaginationPositionParser.parse(paginationConfig.bottomPosition),
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
        <div className={`${style.paginationContainer} ${style[`position_${PaginationPositionParser.parse(position)}`]}`}>
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
                disabled={disabled}
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
            {(visibleTopPagination || tableFilterContext.filtersList.length > 0) && (
                <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr max-content" }}>
                    <FilterChips openFilterModal={openFilterModal} />
                    {visibleTopPagination && <Pagination />}
                </div>
            )}
            <div className={style.content}>{children}</div>
            {visibleBottomPagination && <Pagination position={computedPaginationConfig.bottomPosition} />}
        </div>
    );
};

export default PaginationWrapper;
