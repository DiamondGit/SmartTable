import AddIcon from "@mui/icons-material/Add";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SettingsIcon from "@mui/icons-material/Settings";
import { Skeleton } from "@mui/lab";
import { IconButton } from "@mui/material";
import { Button, Popconfirm } from "antd";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import DataFetchContext from "../../../context/DataFetchContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import { askDeleteRecordByCount, showMessageDeleteRecordByCount } from "../../../functions/global";
import { ModalTypes, Z_ModalTypes } from "../../../types/enums";
import Tooltip from "../../Tooltip";
import style from "../Table.module.scss";
import SearchInput from "./SearchInput";

interface TopBarType {
    computedLoadingConfig: {
        columnCount: number;
        rowCount: number;
        noFuncBtnsLeft: boolean;
        noFuncBtnsRight: boolean;
    };
    toggleFullscreen: () => void;
    openSettingsModal: () => void;
    openFieldModal: (modalType: ModalTypes) => () => void;
}

const TopBar = ({ computedLoadingConfig, toggleFullscreen, openSettingsModal, openFieldModal }: TopBarType) => {
    const { isDefaultConfigLoading, isDefaultConfigLoadingError } = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const filterContext = useContext(FilterContext);
    const propsContext = useContext(PropsContext);
    const stateContext = useContext(StateContext);
    const dataContext = useContext(DataContext);
    const dataFetchContext = useContext(DataFetchContext);
    const { isDataLoading, isDataError } = dataFetchContext;
    const { isFullscreen } = dataContext;

    const isError = isDefaultConfigLoadingError || isDataError;
    const iconStyle = {
        fontSize: 22,
    };

    const isTableDefaultSettings =
        JSON.stringify(configContext.tableConfig) === JSON.stringify(configContext.defaultTableConfig);

    const isAllowedToShowButtons = !stateContext.isDefaultConfigLoadingError && !!configContext.defaultTableConfig;

    const handleAddData = () => {
        dataContext.openDataModal(Z_ModalTypes.enum.ADD);
    };

    const cancelDelete =
        (isFetching = false, isAutoDataUpdate = false) =>
        () => {
            dataContext.setSelectingToDelete(false);
            dataContext.setCancelingDelete(true);
            dataContext.setDataListToDelete([]);
            dataContext.setDeletingError(false);

            if (!isFetching && (dataContext.isFetchRequired || isAutoDataUpdate)) {
                dataFetchContext.getData(filterContext.queryProps);
            }
        };

    const deleteSelectedDatas = () => {
        dataContext.setDeleting(true);
        Promise.allSettled(
            dataContext.dataListToDelete.map((dataId) =>
                dataFetchContext
                    .deleteData(dataId)
                    .then((result) =>
                        Promise.resolve({
                            result: result,
                            dataId: dataId,
                        })
                    )
                    .catch((result) =>
                        Promise.reject({
                            result: result,
                            dataId: dataId,
                        })
                    )
            )
        )
            .then((results) => {
                let hasSuccess = false;
                let hasError = false;
                let listSuccess: number[] = [];
                let listError: number[] = [];
                results.forEach((result) => {
                    if (result.status === "fulfilled" && result.value?.dataId) {
                        hasSuccess = true;
                        listSuccess.push(result.value.dataId);
                    }
                    if (result.status === "rejected" && result.reason?.dataId) {
                        hasError = true;
                        listError.push(result.reason.dataId);
                    }
                });
                let newData = [...dataContext.availableData].filter((record) => !listSuccess.includes(record.id));
                dataContext.setAvailableData(newData);

                if (!dataContext.isFetchRequired) {
                    dataContext.setFetchRequired(hasSuccess);
                }

                dataContext.setDeletingError(hasError);
                dataContext.setDataListToDelete(listError);

                if (hasError) {
                    showMessageDeleteRecordByCount(listError.length, false);
                } else {
                    cancelDelete(false, true)();
                }

                if (hasSuccess) {
                    showMessageDeleteRecordByCount(listSuccess.length);
                }
            })
            .finally(() => {
                dataContext.setDeleting(false);
            });
    };

    const hasDeleteApi = !!configContext.defaultTableConfig?.dataDeleteApi;

    const topBarClasses = [style.topBar];
    if (isFullscreen) topBarClasses.push(style.isFullscreen);

    return (
        <div className={topBarClasses.join(" ")}>
            <h3 className={style.title}>{propsContext.tableTitle}</h3>
            <div className={style.bar}>
                <div className={style.left}>
                    {!dataContext.isSelectingToDelete ? (
                        !isDefaultConfigLoading ? (
                            isAllowedToShowButtons && (
                                <>
                                    {configContext.defaultTableConfig.creatable && stateContext.canCreate && (
                                        <Tooltip
                                            title="Добавить"
                                            placement="top"
                                            disableHoverListener={isDataLoading || isError}
                                        >
                                            <Button
                                                type="primary"
                                                disabled={isError || isDataLoading}
                                                onClick={handleAddData}
                                                style={{ width: "48px", ...(isDataLoading ? { cursor: "wait" } : {}) }}
                                                icon={<AddIcon sx={iconStyle} />}
                                            />
                                        </Tooltip>
                                    )}
                                    {configContext.defaultTableConfig.searchable && <SearchInput isError={isError} />}
                                </>
                            )
                        ) : (
                            !computedLoadingConfig.noFuncBtnsLeft && (
                                <>
                                    <Skeleton variant="rounded" width={48} height={32} animation="wave" />
                                    <Skeleton variant="rounded" width={32} height={32} animation="wave" />
                                </>
                            )
                        )
                    ) : (
                        <>
                            {dataContext.dataListToDelete.length > 0 && (
                                <Popconfirm
                                    title={askDeleteRecordByCount(dataContext.dataListToDelete.length)}
                                    okText="Да"
                                    okButtonProps={{
                                        danger: true,
                                        size: "middle",
                                    }}
                                    onConfirm={deleteSelectedDatas}
                                    cancelText="Нет"
                                    cancelButtonProps={{
                                        size: "middle",
                                    }}
                                >
                                    <Button type="primary" danger loading={dataContext.isDeleting} disabled={!hasDeleteApi}>
                                        {dataContext.isDeleting ? "Удаление" : "Удалить"} (
                                        {dataContext.dataListToDelete.length})
                                    </Button>
                                </Popconfirm>
                            )}
                            <div style={{ width: "max-content" }}>
                                <Button onClick={cancelDelete()} disabled={dataContext.isDeleting}>
                                    Отменить удаление
                                </Button>
                            </div>
                        </>
                    )}
                </div>
                <div className={style.right}>
                    {!isDefaultConfigLoading
                        ? isAllowedToShowButtons && (
                              <>
                                  {configContext.defaultTableConfig.expandable && (
                                      <Tooltip
                                          title="Полноэкранный режим"
                                          placement="top"
                                          disableHoverListener={isDataLoading || isError}
                                      >
                                          <IconButton onClick={toggleFullscreen}>
                                              {isFullscreen ? (
                                                  <CloseFullscreenIcon
                                                      sx={iconStyle}
                                                      className={isFullscreen ? style.activeIcon : ""}
                                                  />
                                              ) : (
                                                  <OpenInFullIcon sx={iconStyle} />
                                              )}
                                          </IconButton>
                                      </Tooltip>
                                  )}
                                  {configContext.filterConfig.length > 0 && (
                                      <Tooltip
                                          title="Фильтр"
                                          placement="top-end"
                                          disableHoverListener={isDataLoading || isError || dataContext.isSelectingToDelete}
                                      >
                                          <IconButton
                                              onClick={openFieldModal(Z_ModalTypes.enum.FILTER)}
                                              disabled={isDataLoading || isError || dataContext.isSelectingToDelete}
                                              style={
                                                  isDataLoading
                                                      ? { cursor: "wait", opacity: 0.5 }
                                                      : isError
                                                      ? { cursor: "not-allowed" }
                                                      : {}
                                              }
                                          >
                                              {
                                                  <FilterAltIcon
                                                      sx={iconStyle}
                                                      className={filterContext.hasFilters ? style.acitveIcon : ""}
                                                  />
                                              }
                                          </IconButton>
                                      </Tooltip>
                                  )}
                                  {configContext.defaultTableConfig.editableTable && (
                                      <Tooltip
                                          title="Настройка таблицы"
                                          placement="top-end"
                                          disableHoverListener={isDataLoading || isError || dataContext.isDeleting}
                                      >
                                          <IconButton
                                              onClick={openSettingsModal}
                                              disabled={isDataLoading || isError || dataContext.isDeleting}
                                              style={
                                                  isDataLoading
                                                      ? { cursor: "wait", opacity: 0.5 }
                                                      : isError
                                                      ? { cursor: "not-allowed" }
                                                      : {}
                                              }
                                          >
                                              {
                                                  <SettingsIcon
                                                      sx={iconStyle}
                                                      className={!isTableDefaultSettings ? style.acitveIcon : ""}
                                                  />
                                              }
                                          </IconButton>
                                      </Tooltip>
                                  )}
                              </>
                          )
                        : !computedLoadingConfig.noFuncBtnsRight && (
                              <>
                                  {[...Array(3)].map((_, index) => (
                                      <div key={index} style={{ padding: "8px" }}>
                                          <Skeleton variant="circular" width={22} height={22} animation="wave" />
                                      </div>
                                  ))}
                              </>
                          )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
