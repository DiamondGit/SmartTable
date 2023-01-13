import { Skeleton } from "@mui/lab";
import { useContext, useEffect, useState } from "react";
import StateContext from "../../context/StateContext";
import Aligner from "../Aligner";
import style from "./Table.module.scss";

interface SkeletonFillerType {
    columnCount: number;
    isHeading?: boolean;
    rowCount?: number;
}

const SkeletonFiller = ({ columnCount, isHeading = false, rowCount = 1 }: SkeletonFillerType) => {
    const { isConfigLoading } = useContext(StateContext);
    const [skeletonHeadingLengths, setSkeletonHeadingLengths] = useState<number[]>();
    const [skeletonLengths, setSkeletonLengths] = useState<number[][]>();

    useEffect(() => {
        setSkeletonHeadingLengths([...Array(columnCount)].map(() => Math.random() * 30 + 60));
        setSkeletonLengths(
            [...Array(rowCount)].map(() => [...Array(columnCount)].map(() => Math.random() * 20 + 60))
        );
    }, [columnCount]);

    const TableDataSkeleton = ({
        index,
        columnIndex = 0,
        isHeadingRow = false,
    }: {
        index: number;
        columnIndex?: number;
        isHeadingRow?: boolean;
    }) => {
        return (
            <Skeleton
                className={isHeadingRow ? "headingSkeleton" : ""}
                variant={"rounded"}
                width={`${(isHeadingRow ? skeletonHeadingLengths?.[index] : skeletonLengths?.[index][columnIndex]) || 75}%`}
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
                            <TableDataSkeleton index={rowIndex} columnIndex={columnIndex} />
                        </td>
                    ));
                    return (
                        <tr key={`skeletonFiller_${rowIndex}`}>
                            {
                                !isConfigLoading &&
                                <td className={style.actionCell}>
                                    <Aligner style={{ width: "100%" }}>
                                        <Skeleton
                                            variant={"rounded"}
                                            width={"18px"}
                                            height={"18px"}
                                            animation={"wave"}
                                        />
                                    </Aligner>
                                </td>
                            }
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
                    <TableDataSkeleton isHeadingRow index={index} />
                </th>
            ))}
        </>
    );
};

export default SkeletonFiller;
