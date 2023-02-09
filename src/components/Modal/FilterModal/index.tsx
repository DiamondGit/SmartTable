import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Alert } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Modal, { ModalType } from "..";
import { FLAG } from "../../../constants/general";
import ConfigContext from "../../../context/ConfigContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import UIContext from "../../../context/UIContext";
import { Z_FilterHighlights, Z_ModalTypes, Z_TableFilterTypes } from "../../../types/enums";
import Aligner from "../../Aligner";
import FilterItem from "./FilterItem";
import style from "./FilterModal.module.scss";
import FiltersResetter from "./FiltersResetter";

interface FilterModalType {
    tableTitle?: string;
    open: boolean;
    setOpen: (state: boolean) => void;
}

const FilterModal = ({ tableTitle = "", open, setOpen }: FilterModalType) => {
    const filterContext = useContext(FilterContext);
    const propsContext = useContext(PropsContext);
    const configContext = useContext(ConfigContext);
    const UI = useContext(UIContext);
    const [isWarnVisible, setWarnVisible] = useState(false);

    const closeModal = () => {
        setOpen(false);
        filterContext.setFilterHighlight((prevHighlight) => ({
            ...prevHighlight,
            filterIds: [],
        }));
    };

    const handleCancelFilter = () => {
        closeModal();
        setWarnVisible(false);
    };

    const handleConfirmFilter = () => {
        if (filterContext.modalFiltersChangesList.every((filter) => filter.value !== null)) {
            handleCancelFilter();
            filterContext.setFiltersList(filterContext.modalFiltersChangesList);
        } else {
            setWarnVisible(true);
            filterContext.setFilterHighlight(() => ({
                type: Z_FilterHighlights.enum.WARNING,
                filterIds: filterContext.modalFiltersChangesList
                    .filter((filter) => filter.value === null)
                    .map((filter) => filter.id),
            }));
        }
    };

    const handleCloseWarn = () => {
        setWarnVisible(false);
    };

    useEffect(() => {
        if (open) {
            filterContext.setModalFiltersList([...filterContext.filtersList]);
            filterContext.setModalFiltersChangesList([...filterContext.filtersList]);
        }
    }, [open]);

    const modalProps: ModalType = {
        Title: () => (
            <Aligner style={{ justifyContent: "flex-start" }} gutter={8}>
                <FilterAltIcon sx={{ fontSize: 24 }} />
                {`Фильтр таблицы "${tableTitle}"`.trim()}
            </Aligner>
        ),
        open: open,
        onConfirm: handleConfirmFilter,
        onCancel: handleCancelFilter,
        type: Z_ModalTypes.enum.FILTER,
        width: 700,
        leftFooter: isWarnVisible && (
            <Alert severity="warning" onClose={handleCloseWarn}>
                {`Имеются не заполненные фильтры`}
            </Alert>
        ),
        rightFooter: (
            <>
                <UI.SecondaryBtn onClick={handleCancelFilter}>Отмена</UI.SecondaryBtn>
                <UI.PrimaryBtn onClick={handleConfirmFilter}>Применить</UI.PrimaryBtn>
            </>
        ),
    };

    const createFilter = () => {
        if (!filterContext.modalFiltersChangesList.some((filter) => filter.field === undefined)) {
            filterContext.setModalFiltersList((prevFilters) => [
                ...prevFilters,
                {
                    id: Date.now(),
                    field: undefined,
                    isExclusion: false,
                    isActive: true,
                    value: null,
                },
            ]);
        }
    };

    useEffect(() => {
        filterContext.setModalFiltersChangesList((prevFiltersList) => {
            return filterContext.modalFiltersList.map(
                (modalFilter) => prevFiltersList.find((filter) => filter.id === modalFilter.id) || modalFilter
            );
        });
    }, [filterContext.modalFiltersList]);

    const deleteItem = (id: number) => {
        filterContext.setModalFiltersList((prevFilters) => prevFilters.filter((prevFilter) => prevFilter.id !== id));
    };

    const notFoundFilters =
        configContext.tableConfig?.table
            .filter((column) => column.filterType === Z_TableFilterTypes.enum.SELECT)
            .filter(
                (columnFilter) => !Object.keys(propsContext.filterApiProvider || {}).includes(columnFilter[FLAG.path])
            ) || [] as any[];

    return (
        <Modal {...modalProps}>
            <div className={style.filterContainer}>
                {notFoundFilters.length > 0 && (
                    <div style={{ color: "red" }}>
                        <span>Not provided API to next fields:</span>
                        <ul>
                            {notFoundFilters.map((columnFilter) => (
                                <li style={{ listStyleType: "disc" }} key={columnFilter[FLAG.path]}>
                                    {columnFilter.title} ({columnFilter[FLAG.path]})
                                </li>
                            ))}
                        </ul>
                        <br />
                    </div>
                )}
                {configContext.tableConfig?.table.some((column) => !!column.filterDependency) && (
                    <div style={{ color: "coral" }}>
                        <ul>
                            {configContext.tableConfig?.table
                                .filter((column) => !!column.filterDependency)
                                .map((columnFilter) => (
                                    <li style={{ listStyleType: "disc" }} key={columnFilter[FLAG.path]}>
                                        {`${columnFilter.title} depends on ${columnFilter.filterDependency}, which is ${
                                            Object.keys(propsContext.filterApiProvider || {}).includes(
                                                columnFilter.filterDependency || ""
                                            )
                                                ? `provided ( ${
                                                      propsContext.filterApiProvider?.[columnFilter.filterDependency || ""]
                                                  } )`
                                                : "not provided"
                                        }`}
                                    </li>
                                ))}
                        </ul>
                        <br />
                    </div>
                )}
                {filterContext.modalFiltersList.length > 0 ? (
                    <table className={style.filterTable}>
                        <thead>
                            <tr>
                                <th className={style.order}></th>
                                <th className={style.activeStatus}></th>
                                <th className={style.columnSelect}>Столбец</th>
                                <th className={style.exclusion}>Исключить</th>
                                <th className={style.filterValue}>Значение</th>
                                <th className={style.delete}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterContext.modalFiltersList.map((filter, index) => (
                                <FilterItem key={filter.id} filter={filter} order={index + 1} deleteItem={deleteItem} />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    "Фильтров нет"
                )}
            </div>
            <UI.OutlinedBtn onClick={createFilter}>+ Добавить фильтр</UI.OutlinedBtn>
            <FiltersResetter />
        </Modal>
    );
};

export default FilterModal;
