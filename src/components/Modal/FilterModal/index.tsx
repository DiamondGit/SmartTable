import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Alert, Checkbox, IconButton, MenuItem, Select as MuiSelect, SelectChangeEvent, Switch } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Modal, { ModalType } from "..";
import TableConfigContext from "../../../context/TableConfigContext";
import TableFilterContext from "../../../context/TableFilterContext";
import TableUIContext from "../../../context/TableUIContext";
import {
    TableColumnType,
    TableFilterItemType,
    Z_FilterHighlights,
    Z_ModalTypes,
    Z_TableFilterType,
} from "../../../types/general";
import Aligner from "../../Aligner";
import DateChanger from "./DateChanger";
import style from "./FilterModal.module.scss";
import SelectChanger from "./SelectChanger";
import SwitchChanger from "./SwitchChanger";
import TextChanger from "./TextChanger";

interface FilterModalType {
    tableTitle?: string;
    open: boolean;
    setOpen: (state: boolean) => void;
}

interface FilterItemType {
    filter: TableFilterItemType;
    order: number;
    deleteItem: (id: number) => void;
}

const FilterValueChangerProvider = ({ filter }: { filter: TableFilterItemType }) => {
    const tableFilterContext = useContext(TableFilterContext);
    const tableConfigContext = useContext(TableConfigContext);
    const currentField = tableFilterContext.modalFiltersChangesList.find(
        (modalFilter) => modalFilter.id === filter.id
    )?.field;
    switch (tableConfigContext.defaultTableConfig?.table.find((column) => column.dataIndex === currentField)?.filterType) {
        case Z_TableFilterType.enum.SELECT:
            return <SelectChanger filter={filter} />;
        case Z_TableFilterType.enum.TEXT:
            return <TextChanger filter={filter} />;
        case Z_TableFilterType.enum.DATE:
            return <DateChanger filter={filter} />;
        case Z_TableFilterType.enum.BOOLEAN:
            return <SwitchChanger filter={filter} />;
        case Z_TableFilterType.enum.CONDITION:
            return <></>;
        default:
            return null;
    }
};

const FilterItem = ({ filter, order, deleteItem }: FilterItemType) => {
    const tableConfigContext = useContext(TableConfigContext);
    const tableConfig = tableConfigContext.defaultTableConfig?.table;
    const tableFilterContext = useContext(TableFilterContext);
    const [animationSwitcher, setAnimationSwitcher] = useState(0);

    const handleDelete = () => {
        deleteItem(filter.id);
    };

    filter = tableFilterContext.modalFiltersChangesList.find((modalFilter) => modalFilter.id === filter.id) || filter;

    const filterableColumns: TableColumnType[] =
        tableConfig?.filter((column) => column.filterType !== Z_TableFilterType.enum.NONE) || [];

    const handleFilterColumnChange = (event: SelectChangeEvent) => {
        const newFilterColumn = event.target.value;
        tableFilterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            prevFilters[filterItemIndex] = { ...prevFilters[filterItemIndex], field: newFilterColumn, value: null };
            return [...prevFilters];
        });
    };

    const toggleActive = (event: React.ChangeEvent<HTMLInputElement>) => {
        tableFilterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            prevFilters[filterItemIndex] = { ...prevFilters[filterItemIndex], isActive: event.target.checked };
            return [...prevFilters];
        });
    };

    useEffect(() => {
        setAnimationSwitcher((prevAnimation) => prevAnimation + 1);
    }, [tableFilterContext.filterHighlight]);

    const filterItemClasses = [style.filterItem];
    if (filter.isActive) filterItemClasses.push(style.active);
    if (tableFilterContext.filterHighlight.filterIds.includes(filter.id)) {
        filterItemClasses.push(
            tableFilterContext.filterHighlight.type === Z_FilterHighlights.enum.HIGHLIGHT ? style.highlight : style.warning
        );
        filterItemClasses.push(style[`highlighted_${animationSwitcher % 2}`]);
    }

    const computedOptions = filterableColumns.filter((filterableColumn) => {
        const defaultColumn = tableConfigContext.defaultTableConfig?.table.find(
            (column) => column.dataIndex === filterableColumn.dataIndex
        );

        return (
            defaultColumn?.filterType !== Z_TableFilterType.enum.BOOLEAN ||
            !tableFilterContext.modalFiltersChangesList.some(
                (modalFilter) => modalFilter.field === defaultColumn.dataIndex && modalFilter.id !== filter.id
            )
        );
    });

    const toggleExclusion = (event: React.ChangeEvent<HTMLInputElement>) => {
        tableFilterContext.setModalFiltersChangesList((prevFilters) => {
            const filterItemIndex = prevFilters.findIndex((prevFilter) => prevFilter.id === filter.id);
            prevFilters[filterItemIndex] = { ...prevFilters[filterItemIndex], isExclusion: event.target.checked };
            return [...prevFilters];
        });
    };

    return (
        <tr className={filterItemClasses.join(" ")}>
            <td className={style.order}>{order}.</td>
            <td className={style.activeStatus}>
                <Checkbox checked={filter.isActive} onChange={toggleActive} />
            </td>
            <td className={style.columnSelect}>
                <MuiSelect
                    size={"small"}
                    value={filter.field}
                    style={{ width: "180px" }}
                    onChange={handleFilterColumnChange}
                    disabled={!filter.isActive}
                >
                    {computedOptions.map((column) => (
                        <MenuItem key={column.dataIndex} value={column.dataIndex}>
                            {column.title}
                        </MenuItem>
                    ))}
                </MuiSelect>
            </td>
            <td className={style.exclusion}>
                <Aligner>
                    <Switch disabled={!filter.isActive} onChange={toggleExclusion} checked={filter.isExclusion} />
                </Aligner>
            </td>
            <td className={style.filterValue}>
                <FilterValueChangerProvider filter={filter} />
            </td>
            <td className={style.delete}>
                <IconButton size={"small"} onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </td>
        </tr>
    );
};

const FilterModal = ({ tableTitle = "", open, setOpen }: FilterModalType) => {
    const tableFilterContext = useContext(TableFilterContext);
    const UI = useContext(TableUIContext);
    const [isWarnVisible, setWarnVisible] = useState(false);

    const closeModal = () => {
        setOpen(false);
        tableFilterContext.setFilterHighlight((prevHighlight) => ({
            ...prevHighlight,
            filterIds: [],
        }));
    };

    const handleCancelFilter = () => {
        closeModal();
        setWarnVisible(false);
    };

    const handleConfirmFilter = () => {
        if (tableFilterContext.modalFiltersChangesList.every((filter) => filter.value !== null)) {
            handleCancelFilter();
            console.log("--- Here ---");
            tableFilterContext.setFiltersList(tableFilterContext.modalFiltersChangesList);
        } else {
            setWarnVisible(true);
            tableFilterContext.setFilterHighlight(() => ({
                type: Z_FilterHighlights.enum.WARNING,
                filterIds: tableFilterContext.modalFiltersChangesList
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
            tableFilterContext.setModalFiltersList([...tableFilterContext.filtersList]);
            tableFilterContext.setModalFiltersChangesList([...tableFilterContext.filtersList]);
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
        if (!tableFilterContext.modalFiltersChangesList.some((filter) => filter.field === undefined)) {
            tableFilterContext.setModalFiltersList((prevFilters) => [
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
        tableFilterContext.setModalFiltersChangesList((prevFiltersList) => {
            return tableFilterContext.modalFiltersList.map(
                (modalFilter) => prevFiltersList.find((filter) => filter.id === modalFilter.id) || modalFilter
            );
        });
    }, [tableFilterContext.modalFiltersList]);

    const deleteItem = (id: number) => {
        tableFilterContext.setModalFiltersList((prevFilters) => prevFilters.filter((prevFilter) => prevFilter.id !== id));
    };

    return (
        <Modal {...modalProps}>
            <div className={style.filterContainer}>
                {tableFilterContext.modalFiltersList.length > 0 ? (
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
                            {tableFilterContext.modalFiltersList.map((filter, index) => (
                                <FilterItem key={filter.id} filter={filter} order={index + 1} deleteItem={deleteItem} />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    "Фильтров нет"
                )}
            </div>
            <UI.OutlinedBtn onClick={createFilter}>+ Добавить фильтр</UI.OutlinedBtn>
        </Modal>
    );
};

export default FilterModal;
