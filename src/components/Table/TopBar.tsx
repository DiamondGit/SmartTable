import AddIcon from "@mui/icons-material/Add";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { Skeleton } from "@mui/lab";
import { useContext } from "react";
import TableUIContext from "../../context/TableUIContext";
import Aligner from "../Aligner";
import style from "./Table.module.scss";

interface TopBarType {
    title: string;
    tableLoading: boolean;
    dataLoading: boolean;
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
    tableLoading,
    dataLoading,
    isFullscreen,
    computedLoadingConfig,
    toggleFullscreen,
    openSettingsModal,
}: TopBarType) => {
    const UI = useContext(TableUIContext);
    const iconStyle = {
        fontSize: 22,
    };
    return (
        <div className={style.topBar}>
            <div className={`${style.bar} ${style.left}`}>
                {!tableLoading ? (
                    <h3 className={style.title}>{title}</h3>
                ) : (
                    <Aligner style={{ gap: "16px", opacity: "0.75" }}>
                        <Skeleton variant={"rounded"} width={200} height={32} animation={"wave"} />
                        {!computedLoadingConfig.noFuncBtnsLeft && (
                            <>
                                <Skeleton variant={"rounded"} width={50} height={32} animation={"wave"} />
                                <Skeleton variant={"circular"} width={32} height={32} animation={"wave"} />
                            </>
                        )}
                    </Aligner>
                )}
                {!tableLoading && (
                    <>
                        <UI.PrimaryBtn loading={dataLoading}>
                            <AddIcon sx={iconStyle} />
                        </UI.PrimaryBtn>
                        <UI.SecondaryBtn loading={dataLoading}>
                            <SearchIcon sx={iconStyle} />
                        </UI.SecondaryBtn>
                    </>
                )}
            </div>
            <div className={`${style.bar} ${style.right}`}>
                {!tableLoading ? (
                    <>
                        <UI.SecondaryBtn loading={dataLoading} onClick={toggleFullscreen}>
                            {isFullscreen ? (
                                <CloseFullscreenIcon sx={iconStyle} className={isFullscreen ? style.activeIcon : ""} />
                            ) : (
                                <OpenInFullIcon sx={iconStyle} />
                            )}
                        </UI.SecondaryBtn>
                        <UI.SecondaryBtn loading={dataLoading}>
                            <FilterAltIcon sx={iconStyle} />
                        </UI.SecondaryBtn>
                        <UI.SecondaryBtn loading={dataLoading} onClick={openSettingsModal}>
                            <SettingsIcon sx={iconStyle} />
                        </UI.SecondaryBtn>
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
