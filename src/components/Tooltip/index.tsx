import { Tooltip as MuiTooltip, tooltipClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { GeneralObject } from "../../types/general";

const Tooltip = styled(
    React.forwardRef((props: GeneralObject, ref) => (
        <MuiTooltip
            title={props.title}
            arrow
            disableInteractive
            classes={{ popper: props.className }}
            placement={props.placement || "top"}
            children={<div ref={ref as React.Ref<HTMLDivElement> | undefined}>{props.children}</div>}
        />
    ))
)(() => ({
    zIndex: 9999999,
    [`& .${tooltipClasses.arrow}`]: {
        color: "#2d2e30",
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#2d2e30",
        fontSize: 12,
        letterSpacing: 1.1,
    },
}));

export default Tooltip;
