import { Skeleton } from "@mui/material";
import { useContext } from "react";
import DataContext from "../context/DataContext";
import { TableDataTypes, Z_TableDataTypes } from "../types/enums";
export const ErrorText = ({ text }: { text: string }) => {
    return <span style={{ width: "100%", textAlign: "left", color: "#ff3333" }}>{text}</span>;
};

export const TableDataSkeleton = ({
    dataType = Z_TableDataTypes.enum.TEXT,
    isHeadingRow = false,
}: {
    dataType?: TableDataTypes;
    isHeadingRow?: boolean;
}) => {
    const { isFullscreen } = useContext(DataContext);
    let placement = {};
    if (dataType === Z_TableDataTypes.enum.NUMBER) placement = { marginLeft: "auto" };
    else if (dataType === Z_TableDataTypes.enum.DATE || dataType === Z_TableDataTypes.enum.OTHER)
        placement = { margin: "0 auto" };
    return isFullscreen ? (
        <div style={{ width: "75%", height: "18px", borderRadius: "6px", backgroundColor: "#d9d9d9" }} />
    ) : (
        <Skeleton
            className={isHeadingRow ? "headingSkeleton" : ""}
            variant="rounded"
            width={`${isHeadingRow ? 75 : 60}%`}
            height="18px"
            animation="wave"
            style={placement}
        />
    );
};
