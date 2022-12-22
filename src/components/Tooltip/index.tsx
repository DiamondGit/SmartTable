import { Tooltip as MuiTooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const Tooltip = styled(({ className, ...props }: TooltipProps) => (
    <MuiTooltip
        {...props}
        arrow
        disableInteractive
        classes={{ popper: className }}
        placement={props.placement || "top"}
        children={<div>{props.children}</div>}
    />
))(() => ({
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
