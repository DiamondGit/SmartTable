import AddIcon from "@mui/icons-material/Add";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SettingsIcon from "@mui/icons-material/Settings";
import { Skeleton } from "@mui/lab";
import { Popconfirm } from "antd";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import DataContext from "../../../context/DataContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import UIContext from "../../../context/UIContext";
import { askDeleteRecordByCount, showMessageDeleteRecordByCount } from "../../../functions/global";
import { Z_ModalTypes } from "../../../types/enums";
import Aligner from "../../Aligner";
import Tooltip from "../../Tooltip";
import style from "../Table.module.scss";
import SearchInput from "./SearchInput";

interface TopBarType {
    isFullscreen: boolean;
    computedLoadingConfig: {
        columnCount: number;
        rowCount: number;
        noFuncBtnsLeft: boolean;
        noFuncBtnsRight: boolean;
    };
    toggleFullscreen: () => void;
    openSettingsModal: () => void;
    openFilterModal: () => void;
}

const TopBar = ({
    isFullscreen,
    computedLoadingConfig,
    toggleFullscreen,
    openSettingsModal,
    openFilterModal,
}: TopBarType) => {
    const { isDefaultConfigLoading, isDefaultConfigLoadingError } = useContext(StateContext);
    const configContext = useContext(ConfigContext);
    const filterContext = useContext(FilterContext);
    const propsContext = useContext(PropsContext);
    const stateContext = useContext(StateContext);
    const dataContext = useContext(DataContext);
    const UI = useContext(UIContext);
    const { isDataLoading, isDataError } = propsContext;

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
                propsContext.paginationConfig?.getData?.(filterContext.queryProps);
            }
        };

    const deleteSelectedDatas = () => {
        dataContext.setDeleting(true);
        Promise.allSettled(
            dataContext.dataListToDelete.map((dataId) =>
                propsContext.paginationConfig
                    ?.deleteData?.(dataId)
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

    const hasDeleteApi = !!propsContext.paginationConfig?.deleteData;

    return (
        <div className={style.topBar}>
            <div className={`${style.bar} ${style.left}`}>
                <h3 className={style.title}>{propsContext.tableTitle}</h3>
                {!dataContext.isSelectingToDelete ? (
                    !isDefaultConfigLoading ? (
                        isAllowedToShowButtons && (
                            <>
                                <Tooltip
                                    title={"Добавить"}
                                    placement={"top"}
                                    disableHoverListener={isDataLoading || isError}
                                >
                                    <UI.PrimaryBtn loading={isDataLoading} disabled={isError} onClick={handleAddData}>
                                        <AddIcon sx={iconStyle} />
                                    </UI.PrimaryBtn>
                                </Tooltip>
                                {!isError && <SearchInput loading={isDataLoading} />}
                            </>
                        )
                    ) : (
                        !computedLoadingConfig.noFuncBtnsLeft && (
                            <>
                                <Skeleton variant={"rounded"} width={40} height={32} animation={"wave"} />
                                <Skeleton variant={"rounded"} width={32} height={32} animation={"wave"} />
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
                                <Tooltip title={"Отсутствует API для удаления!"} disableHoverListener={hasDeleteApi}>
                                    <UI.PrimaryBtn loading={dataContext.isDeleting} disabled={!hasDeleteApi}>
                                        {dataContext.isDeleting ? "Удаление" : "Удалить"} (
                                        {dataContext.dataListToDelete.length})
                                    </UI.PrimaryBtn>
                                </Tooltip>
                            </Popconfirm>
                        )}
                        <div style={{ width: "max-content" }}>
                            <UI.SecondaryBtn onClick={cancelDelete()} disabled={dataContext.isDeleting}>
                                Отменить удаление
                            </UI.SecondaryBtn>
                        </div>
                    </>
                )}
            </div>
            <div className={`${style.bar} ${style.right}`}>
                {!isDefaultConfigLoading
                    ? isAllowedToShowButtons && (
                          <>
                              <Tooltip
                                  title={"Полноэкранный режим"}
                                  placement={"top"}
                                  disableHoverListener={isDataLoading || isError}
                              >
                                  <UI.SecondaryBtn loading={isDataLoading} onClick={toggleFullscreen} disabled={isError}>
                                      {isFullscreen ? (
                                          <CloseFullscreenIcon
                                              sx={iconStyle}
                                              className={isFullscreen ? style.activeIcon : ""}
                                          />
                                      ) : (
                                          <OpenInFullIcon sx={iconStyle} />
                                      )}
                                  </UI.SecondaryBtn>
                              </Tooltip>
                              <Tooltip
                                  title={"Фильтр"}
                                  placement={"top-end"}
                                  disableHoverListener={isDataLoading || isError || dataContext.isSelectingToDelete}
                              >
                                  <UI.SecondaryBtn
                                      loading={isDataLoading}
                                      onClick={openFilterModal}
                                      disabled={isError || dataContext.isSelectingToDelete}
                                  >
                                      <FilterAltIcon
                                          sx={iconStyle}
                                          className={filterContext.hasFilters ? style.acitveIcon : ""}
                                      />
                                  </UI.SecondaryBtn>
                              </Tooltip>
                              <Tooltip
                                  title={"Настройка таблицы"}
                                  placement={"top-end"}
                                  disableHoverListener={isDataLoading || isError || dataContext.isDeleting}
                              >
                                  <UI.SecondaryBtn
                                      loading={isDataLoading}
                                      onClick={openSettingsModal}
                                      disabled={isError || dataContext.isDeleting}
                                  >
                                      <SettingsIcon
                                          sx={iconStyle}
                                          className={!isTableDefaultSettings ? style.acitveIcon : ""}
                                      />
                                  </UI.SecondaryBtn>
                              </Tooltip>
                          </>
                      )
                    : !computedLoadingConfig.noFuncBtnsRight && (
                          <Aligner style={{ gap: "18px", opacity: "0.75" }}>
                              {[...Array(3)].map((_, index) => (
                                  <Skeleton variant={"circular"} width={32} height={32} animation={"wave"} key={index} />
                              ))}
                          </Aligner>
                      )}
            </div>
        </div>
    );
};

export default TopBar;
