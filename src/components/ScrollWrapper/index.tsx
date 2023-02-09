import style from "./ScrollWrapper.module.scss";

const ScrollWrapper = ({ isFullscreen, children }: { isFullscreen: boolean; children: React.ReactNode }) => {
    const wrapperClasses = [style.wrapper];
    if (isFullscreen) wrapperClasses.push(style.fullscreen);

    return (
        <div className={wrapperClasses.join(" ")}>
            {children}
        </div>
    );
};

export default ScrollWrapper;