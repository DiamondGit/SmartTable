import AddIcon from "@mui/icons-material/Add";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SettingsIcon from "@mui/icons-material/Settings";
import { Skeleton } from "@mui/lab";
import { useContext } from "react";
import TableConfigContext from "../../context/TableConfigContext";
import TableUIContext from "../../context/TableUIContext";
import Aligner from "../Aligner";
import Tooltip from "../Tooltip";
import SearchInput from "./SearchInput";
import style from "./Table.module.scss";

interface TopBarType {
    title: string;
    isConfigLoading: boolean;
    isDataLoading: boolean;
    isError: boolean;
    isFullscreen: boolean;
    computedLoadingConfig: {
        columnCount: number;
        rowCount: number;
        noFuncBtnsLeft: boolean;
        noFuncBtnsRight: boolean;
    };
    toggleFullscreen: () => void;
    openSettingsModal: () => void;
}

const TopBar = ({
    title,
    isConfigLoading,
    isDataLoading,
    isError,
    isFullscreen,
    computedLoadingConfig,
    toggleFullscreen,
    openSettingsModal,
}: TopBarType) => {
    const tableConfigContext = useContext(TableConfigContext);
    const UI = useContext(TableUIContext);
    const iconStyle = {
        fontSize: 22,
    };

    const isTableDefaultSettings =
        JSON.stringify(tableConfigContext.tableConfig) === JSON.stringify(tableConfigContext.defaultTableConfig);

    return (
        <Aligner style={{ justifyContent: "space-between" }} className={style.topBar}>
            <Aligner className={`${style.bar} ${style.left}`} gutter={12}>
                <h3 className={style.title}>{title}</h3>
                {!isConfigLoading
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
                              <Skeleton variant={"circular"} width={32} height={32} animation={"wave"} />
                          </>
                      )}
            </Aligner>
            <Aligner className={`${style.bar} ${style.right}`} gutter={6}>
                {!isConfigLoading
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
                                  <UI.SecondaryBtn loading={isDataLoading}>
                                      <FilterAltIcon sx={iconStyle} />
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
                                          className={`${!isTableDefaultSettings ? style.acitveIcon : ""}`}
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
