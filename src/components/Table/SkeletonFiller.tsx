import { Skeleton } from "@mui/lab";
import style from "./Table.module.scss";

interface SkeletonFillerType {
    columnCount: number;
    isHeading?: boolean;
    rowCount?: number;
}

const SkeletonFiller = ({ columnCount, isHeading = false, rowCount = 1 }: SkeletonFillerType) => {
    const TableDataSkeleton = ({ isHeadingRow = false }) => {
        return (
            <Skeleton
                className={isHeadingRow ? "headingSkeleton" : ""}
                variant={"rounded"}
                width={`${Math.random() * 30 + (isHeadingRow ? 35 : 25)}%`}
                height={"18px"}
                animation={"wave"}
            />
        );
    };

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
                        <tr className={style.row} key={`skeletonFiller_${rowIndex}`}>
                            {skeletons}
                        </tr>
                    );
                })}
            </>
        );
    return (
        <>
            {[...Array(columnCount)].map((_, index) => (
                <th className={style.heading} key={"skeletonFiller_" + index}>
                    <TableDataSkeleton isHeadingRow />
                </th>
            ))}
        </>
    );
};

export default SkeletonFiller;