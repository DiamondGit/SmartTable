import { useContext } from "react";
import DataContext from "../../context/DataContext";
import DataFetchContext from "../../context/DataFetchContext";
import style from "./ScrollWrapper.module.scss";

const ScrollWrapper = ({ children }: { children: React.ReactNode }) => {
    const { isDataLoading } = useContext(DataFetchContext);
    const { isFullscreen } = useContext(DataContext);
    const wrapperClasses = [style.wrapper];
    if (isFullscreen) wrapperClasses.push(style.fullscreen);
    if (isDataLoading) wrapperClasses.push(style.loading);

    return (
        <div className={wrapperClasses.join(" ")}>
            {children}
        </div>
    );
};

export default ScrollWrapper;