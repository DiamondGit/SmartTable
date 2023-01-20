import { useEffect, useRef, useState } from "react";

const leftShadow = "left";
const rightShadow = "right";

export function useScrollWithShadow() {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const [boxShadowClasses, setBoxShadowClasses] = useState(["scrollShadowContainer"]);
    const prevBoxShadow = useRef(boxShadowClasses);

    const doShadow = () => {
        if (!scrollContainer.current) return;
        const scrollLeft = scrollContainer.current.scrollLeft;
        const scrollWidth = scrollContainer.current.scrollWidth;
        const clientWidth = scrollContainer.current.clientWidth;

        const hasScroll = scrollWidth !== clientWidth;
        const lastPosition = scrollWidth - clientWidth;

        const hasRightPart = scrollLeft === 0;
        const isBetween = 1 <= scrollLeft && scrollLeft < lastPosition - 1;

        let tempboxShadowClasses = ["scrollShadowContainer"];

        if (hasScroll) {
            if (hasRightPart) {
                tempboxShadowClasses.push(rightShadow);
            } else if (isBetween) {
                tempboxShadowClasses.push(leftShadow);
                tempboxShadowClasses.push(rightShadow);
            } else {
                tempboxShadowClasses.push(leftShadow);
            }
        }

        const hasChanged = JSON.stringify(tempboxShadowClasses) !== JSON.stringify(prevBoxShadow.current);
        if (hasChanged) {
            prevBoxShadow.current = tempboxShadowClasses;
            setBoxShadowClasses((prevClasses) => tempboxShadowClasses);
        }
    };

    const updateDimensions = () => {
        if (scrollContainer.current) {
            doShadow();
        }
    };

    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        if (scrollContainer.current) {
            doShadow();
        }
        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    useEffect(() => {
        doShadow();
    }, [scrollContainer, scrollContainer.current?.scrollWidth]);

    const onScrollHandler = () => {
        doShadow();
    };

    return { scrollContainer, boxShadowClasses, onScrollHandler, doShadow };
}
