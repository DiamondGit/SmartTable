import { useState, useContext, useEffect } from "react";
import ConfigContext from "../../context/ConfigContext";
import StateContext from "../../context/StateContext";
import { useScrollWithShadow } from "../../functions/useScrollWithShadow";
import { TablePinOptions, Z_TablePinOptions } from "../../types/general";
import style from "./ShadowWrapper.module.scss";

const ShadowWrapper = ({ children }: { children: React.ReactNode }) => {
    const { scrollContainer, boxShadowClasses, onScrollHandler, doShadow } = useScrollWithShadow();
    const configContext = useContext(ConfigContext);
    const stateContext = useContext(StateContext);
    const [isLeftPinsVisible, setLeftPinsVisible] = useState(true);

    useEffect(() => {
        doShadow();
    }, [configContext.tableConfig, stateContext.data]);

    useEffect(() => {
        stateContext.setTableHasLeftShadow(boxShadowClasses.includes("left"));
    }, [boxShadowClasses]);

    const computedBoxShadowClasses = boxShadowClasses.map((boxShadowClass) => style[boxShadowClass]);

    const getSideOffset = (pinSide: TablePinOptions) => {
        const sidePins = stateContext.tableColumnPins.filter((tableColumnPin) => tableColumnPin.pin === pinSide);
        const offset =
            sidePins?.reduce((offsetSum, columnPin) => offsetSum + columnPin.width, 0) + sidePins?.length - 1 || 0;
        return pinSide === Z_TablePinOptions.enum.LEFT && sidePins.length === 1 && sidePins[0].order === -1 ? 0 : offset;
    };

    const leftOffset = getSideOffset(Z_TablePinOptions.enum.LEFT);
    const rightOffset = getSideOffset(Z_TablePinOptions.enum.RIGHT);

    const updateShadowVisibility = () => {
        setLeftPinsVisible((scrollContainer.current?.clientWidth || 0) > leftOffset + rightOffset);
    };

    useEffect(() => {
        window.addEventListener("resize", updateShadowVisibility);
        return () => {
            window.removeEventListener("resize", updateShadowVisibility);
        };
    }, []);

    useEffect(() => {
        updateShadowVisibility();
    }, [stateContext.tableColumnPins]);

    return (
        <div className={computedBoxShadowClasses.join(" ")}>
            <div
                className={`${style.shadow} ${style.left}`}
                style={{ left: leftOffset, display: isLeftPinsVisible ? "block" : "none" }}
            />
            <div className={`${style.shadow} ${style.right}`} style={{ right: rightOffset }} />
            <div ref={scrollContainer} style={{ overflowX: "auto" }} onScroll={onScrollHandler}>
                {children}
            </div>
        </div>
    );
};

export default ShadowWrapper;
