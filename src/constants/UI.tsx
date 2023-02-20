import Tooltip from "../components/Tooltip";
import { GeneralObject } from "../types/general";

type ErrorControllerType = {
    error: any;
    fieldName?: string | null;
    record?: GeneralObject | null;
    isTooltip?: boolean;
    isSuccess?: boolean;
    children?: React.ReactNode;
};

export const ErrorController = ({
    error,
    fieldName = null,
    record = null,
    isTooltip = false,
    isSuccess = false,
    children,
}: ErrorControllerType) => {
    const ErrorText = ({ content }: { content: React.ReactNode }) => {
        if (!content) return null;
        return <p style={{ color: isSuccess ? "green" : "red", margin: 0 }}>{content}</p>;
    };

    if (!error) return null;

    const isObject = typeof error === "object";
    const hasRecord = !!record && typeof record === "object";
    const isCorrectRow = error?.id === record?.id || error?.id === record?.key || false;

    if (!isObject) return <ErrorText content={error} />;
    let errorFieldValue = null;

    if (isTooltip) errorFieldValue = error?.error || null;
    else {
        if (!fieldName) fieldName = "error";

        const fields = fieldName.split(".");

        errorFieldValue = error[fields[0]];
        if (fields.length > 1) {
            for (let i = 1; i < fields.length; i++) {
                errorFieldValue = errorFieldValue?.[fields[i]] || null;
            }
        }
    }

    if (hasRecord) {
        if (!isTooltip) {
            if (!isCorrectRow || !errorFieldValue) return null;
            return <ErrorText content={errorFieldValue} />;
        } else {
            if (!isCorrectRow || !errorFieldValue) return <div>{children}</div>;
            return (
                <Tooltip title={errorFieldValue}>
                    <div style={{ width: "max-content" }}>
                        <ErrorText content={children} />
                    </div>
                </Tooltip>
            );
        }
    }
    return <ErrorText content={errorFieldValue} />;
};
