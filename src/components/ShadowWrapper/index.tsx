import { useState, useContext, useEffect, useRef } from "react";
import ConfigContext from "../../context/ConfigContext";
import DataContext from "../../context/DataContext";
import DataFetchContext from "../../context/DataFetchContext";
import PropsContext from "../../context/PropsContext";
import StateContext from "../../context/StateContext";
import { useScrollWithShadow } from "../../functions/useScrollWithShadow";
import { TablePinOptions, Z_TablePinOptions } from "../../types/enums";
import style from "./ShadowWrapper.module.scss";

const ShadowWrapper = ({ children }: { children: React.ReactNode }) => {
    const { scrollContainer, boxShadowClasses, onScrollHandler, doShadow } = useScrollWithShadow();
    const configContext = useContext(ConfigContext);
    const stateContext = useContext(StateContext);
    const dataFetchContext = useContext(DataFetchContext);
    const [isLeftPinsVisible, setLeftPinsVisible] = useState(true);

    useEffect(() => {
        doShadow();
    }, [configContext.tableConfig, dataFetchContext.data]);

    useEffect(() => {
        stateContext.setTableHasLeftShadow(boxShadowClasses.includes("left"));
    }, [boxShadowClasses]);

    const computedBoxShadowClasses = boxShadowClasses.map((boxShadowClass) => style[boxShadowClass]);

    const getSideOffset = (pinSide: TablePinOptions) => {
        const sidePins = stateContext.columnPins.filter((tableColumnPin) => tableColumnPin.pin === pinSide);
        const offset =
            sidePins?.reduce((offsetSum, columnPin) => offsetSum + columnPin.width, 0) || 0;
        return pinSide === Z_TablePinOptions.enum.LEFT && sidePins.length === 1 && sidePins[0].order === -1 ? 0 : offset;
    };

    const leftOffset = getSideOffset(Z_TablePinOptions.enum.LEFT);
    const rightOffset = getSideOffset(Z_TablePinOptions.enum.RIGHT);

    const updateShadowVisibility = () => {
        const newValue = (scrollContainer.current?.clientWidth || 0) > leftOffset + rightOffset;
        if (newValue !== isLeftPinsVisible) {
            setLeftPinsVisible(() => newValue);
        }
    };

    useEffect(() => {
        window.addEventListener("resize", updateShadowVisibility);
        return () => {
            window.removeEventListener("resize", updateShadowVisibility);
        };
    });

    useEffect(() => {
        updateShadowVisibility();
    }, [stateContext.columnPins]);

    return (
        <div className={computedBoxShadowClasses.join(" ")}>
            <div
                className={`${style.shadow} ${style.left}`}
                style={{ left: leftOffset, display: isLeftPinsVisible ? "block" : "none" }}
            />
            <div className={`${style.shadow} ${style.right}`} style={{ right: rightOffset }} />
            <div ref={scrollContainer} onScroll={onScrollHandler}>
                {children}
            </div>
        </div>
    );
};

export default ShadowWrapper;
