import AddIcon from "@mui/icons-material/Add";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SettingsIcon from "@mui/icons-material/Settings";
import { Skeleton } from "@mui/lab";
import { useContext } from "react";
import ConfigContext from "../../../context/ConfigContext";
import FilterContext from "../../../context/FilterContext";
import PropsContext from "../../../context/PropsContext";
import StateContext from "../../../context/StateContext";
import UIContext from "../../../context/UIContext";
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
    const UI = useContext(UIContext);
    const { isDataLoading, isDataError } = propsContext;

    const isError = isDefaultConfigLoadingError || isDataError;
    const iconStyle = {
        fontSize: 22,
    };

    const hasFilters = filterContext.filtersList.length > 0;

    const isTableDefaultSettings =
        JSON.stringify(configContext.tableConfig) === JSON.stringify(configContext.defaultTableConfig);

    return (
        <Aligner style={{ justifyContent: "space-between" }} className={style.topBar}>
            <Aligner className={`${style.bar} ${style.left}`} gutter={12}>
                <h3 className={style.title}>{propsContext.tableTitle}</h3>
                {!isDefaultConfigLoading
                    ? !isError && (
                          <>
                              <Tooltip title={"Добавить"} placement={"top"} disableHoverListener={isDataLoading}>
                                  <UI.PrimaryBtn loading={isDataLoading}>
                                      <AddIcon sx={iconStyle} />
                                  </UI.PrimaryBtn>
                              </Tooltip>
                              <SearchInput loading={isDataLoading} />
                          </>
                      )
                    : !computedLoadingConfig.noFuncBtnsLeft && (
                          <>
                              <Skeleton variant={"rounded"} width={40} height={32} animation={"wave"} />
                              <Skeleton variant={"rounded"} width={32} height={32} animation={"wave"} />
                          </>
                      )}
            </Aligner>
            <Aligner className={`${style.bar} ${style.right}`} gutter={6}>
                {!isDefaultConfigLoading
                    ? !isError && (
                          <>
                              <Tooltip title={"Полноэкранный режим"} placement={"top"} disableHoverListener={isDataLoading}>
                                  <UI.SecondaryBtn loading={isDataLoading} onClick={toggleFullscreen}>
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
                              <Tooltip title={"Фильтр"} placement={"top-end"} disableHoverListener={isDataLoading}>
                                  <UI.SecondaryBtn loading={isDataLoading} onClick={openFilterModal}>
                                      <FilterAltIcon sx={iconStyle} className={hasFilters ? style.acitveIcon : ""} />
                                  </UI.SecondaryBtn>
                              </Tooltip>
                              <Tooltip
                                  title={"Настройка таблицы"}
                                  placement={"top-end"}
                                  disableHoverListener={isDataLoading}
                              >
                                  <UI.SecondaryBtn loading={isDataLoading} onClick={openSettingsModal}>
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
            </Aligner>
        </Aligner>
    );
};

export default TopBar;
