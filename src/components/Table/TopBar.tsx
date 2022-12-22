import AddIcon from "@mui/icons-material/Add";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { Skeleton } from "@mui/lab";
import { useContext } from "react";
import TableStateContext from "../../context/TableStateContext";
import TableUIContext from "../../context/TableUIContext";
import Aligner from "../Aligner";
import Tooltip from "../Tooltip";
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
    const tableStateContext = useContext(TableStateContext);
    const UI = useContext(TableUIContext);
    const iconStyle = {
        fontSize: 22,
    };

    return (
        <div className={style.topBar}>
            <div className={`${style.bar} ${style.left}`}>
                {!isConfigLoading ? (
                    <>
                        <h3 className={style.title}>{title}</h3>
                        {!isError && (
                            <>
                                <Tooltip title={"Добавить"} placement={"top"} disableHoverListener={isDataLoading}>
                                    <UI.PrimaryBtn loading={isDataLoading}>
                                        <AddIcon sx={iconStyle} />
                                    </UI.PrimaryBtn>
                                </Tooltip>
                                <UI.SecondaryBtn loading={isDataLoading}>
                                    <SearchIcon sx={iconStyle} />
                                </UI.SecondaryBtn>
                            </>
                        )}
                    </>
                ) : (
                    <Aligner gutter={6}>
                        <h3 className={style.title}>{title}</h3>
                        {!computedLoadingConfig.noFuncBtnsLeft && (
                            <Aligner gutter={12}>
                                <Skeleton variant={"rounded"} width={40} height={32} animation={"wave"} />
                                <Skeleton variant={"circular"} width={32} height={32} animation={"wave"} />
                            </Aligner>
                        )}
                    </Aligner>
                )}
            </div>
            <div className={`${style.bar} ${style.right}`}>
                {!isConfigLoading ? (
                    <>
                        {
                            !isError &&
                            <>
                                <Tooltip title={"Полноэкранный режим"} placement={"top"} disableHoverListener={isDataLoading}>
                                    <UI.SecondaryBtn loading={isDataLoading} onClick={toggleFullscreen}>
                                        {isFullscreen ? (
                                            <CloseFullscreenIcon sx={iconStyle} className={isFullscreen ? style.activeIcon : ""} />
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
                                <Tooltip title={"Настройка таблицы"} placement={"top-end"} disableHoverListener={isDataLoading}>
                                    <UI.SecondaryBtn loading={isDataLoading} onClick={openSettingsModal}>
                                        <SettingsIcon
                                            sx={iconStyle}
                                            className={`${tableStateContext.isSettingsChanged ? style.acitveIcon : ""}`}
                                        />
                                    </UI.SecondaryBtn>
                                </Tooltip>
                            </>
                        }
                    </>
                ) : (
                    <>
                        {!computedLoadingConfig.noFuncBtnsRight && (
                            <Aligner style={{ gap: "18px", opacity: "0.75" }}>
                                {[...Array(3)].map((_, index) => (
                                    <Skeleton variant={"circular"} width={32} height={32} animation={"wave"} key={index} />
                                ))}
                            </Aligner>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TopBar;
