import AnnouncementIcon from "@mui/icons-material/Announcement";
import { Col } from "antd";
import { useContext } from "react";
import { ErrorText } from "../../../constants/UI";
import DataContext from "../../../context/DataContext";
import FieldModalContext from "../../../context/FieldModalContext";
import { Z_DependencyActions } from "../../../types/enums";
import { ColumnType } from "../../../types/general";
import Aligner from "../../Aligner";
import Tooltip from "../../Tooltip";
import FieldInput from "./FieldInput";

type FieldItemType = {
    field: ColumnType;
    showDataChangedIcon: boolean;
};

const FieldItem = ({ field, showDataChangedIcon }: FieldItemType) => {
    const { config, isFilterModal, isDataModal, isModalOpen } = useContext(FieldModalContext);
    const dataContext = useContext(DataContext);

    // HIDE case
    if (
        isDataModal &&
        field.dependField &&
        typeof field.dependField === "string" &&
        typeof field.onDependChange === "object" &&
        !Array.isArray(field.onDependChange)
    ) {
        const isConditionTrue = field.onDependChange?.value === dataContext.modalData[field.dependField];
        if ((isConditionTrue && field.onDependChange?.onTrue) || (!isConditionTrue && field.onDependChange?.onFalse)) {
            if (
                (isConditionTrue ? field.onDependChange.onTrue : field.onDependChange.onFalse)?.includes(
                    Z_DependencyActions.enum.HIDE
                )
            )
                return null;
        }
    }

    if (!field[config]?.dataIndex_write) return null;
    const dataIndex = field[config]?.dataIndex_write as string;
    const isError = isDataModal && dataContext.dataFieldErrors[dataIndex] !== undefined;
    return (
        <Col span={12}>
            <Aligner style={{ justifyContent: "stretch" }} isVertical gutter={2}>
                {isModalOpen &&
                    (isFilterModal ? (
                        <span style={{ width: "100%", textAlign: "left" }}>{field[config]?.title}</span>
                    ) : (
                        <Aligner style={{ justifyContent: "flex-start", alignItems: "center", width: "100%", gap: "0 8px" }}>
                            {field[config]?.title}
                            {!field.isRequired && <span style={{ color: "#aaa" }}>(Необяз.)</span>}
                            {showDataChangedIcon &&
                                dataContext.dataOldValues[dataIndex] !== dataContext.modalData[dataIndex] && (
                                    <Tooltip title="Значение было изменено">
                                        <Aligner style={{ color: "#aaa" }}>
                                            <AnnouncementIcon sx={{ fontSize: "16px" }} />
                                        </Aligner>
                                    </Tooltip>
                                )}
                        </Aligner>
                    ))}
                <div style={{ width: "100%", position: "relative" }}>
                    <FieldInput field={field} isError={isError} />
                </div>
                {isError && <ErrorText text={dataContext.dataFieldErrors[dataIndex]} />}
            </Aligner>
        </Col>
    );
};

export default FieldItem;
