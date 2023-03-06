import { Skeleton } from "@mui/lab";
import { useContext } from "react";
import { TableDataSkeleton } from "../../constants/UI";
import ConfigContext from "../../context/ConfigContext";
import StateContext from "../../context/StateContext";
import Aligner from "../Aligner";
import style from "./Table.module.scss";

interface SkeletonFillerType {
    columnCount: number;
    isHeading?: boolean;
    rowCount?: number;
}

const SkeletonFiller = ({ columnCount, isHeading = false, rowCount = 1 }: SkeletonFillerType) => {
    const { isDefaultConfigLoading } = useContext(StateContext);
    const { hasActionColumn } = useContext(ConfigContext);

    if (!isHeading)
        return (
            <>
                {[...Array(rowCount)].map((_, rowIndex) => {
                    const skeletons = [...Array(columnCount)].map((_, columnIndex) => (
                        <td key={`skeletonFiller_${rowIndex}_${columnIndex}`}>
                            <TableDataSkeleton />
                        </td>
                    ));
                    return (
                        <tr key={`skeletonFiller_${rowIndex}`}>
                            {!isDefaultConfigLoading && hasActionColumn && (
                                <td className={style.actionCell}>
                                    <Aligner style={{ width: "100%" }}>
                                        <Skeleton variant="rounded" width="18px" height="18px" animation="wave" />
                                    </Aligner>
                                </td>
                            )}
                            {skeletons}
                        </tr>
                    );
                })}
            </>
        );
    return (
        <>
            {[...Array(columnCount)].map((_, index) => (
                <th className={style.skeletonFiller} key={"skeletonFiller_" + index}>
                    <TableDataSkeleton isHeadingRow />
                </th>
            ))}
        </>
    );
};

export default SkeletonFiller;
