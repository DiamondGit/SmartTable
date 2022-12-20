import { TableColumnSchema, TableConfigSchema, TableConfigType } from "../../types/general";
import style from "./JsonPreviewer.module.scss";

interface JsonPreviewerType {
    json: TableConfigType;
}

const JsonPreviewer = ({ json }: JsonPreviewerType) => {
    if (!json) return null;

    let jsonString = JSON.stringify(json, null, 2);

    TableColumnSchema._getCached().keys.concat(TableConfigSchema._getCached().keys).forEach((regex, index) => {
        jsonString = jsonString.replaceAll(
            JSON.stringify(regex) + ":",
            `<span style="color: #afcdfa">${JSON.stringify(regex)}</span>:`
        );
    });

    return (
        <div
            className={style.codeEditorText}
        >
            <pre
                className={style.container}
                dangerouslySetInnerHTML={{
                    __html: jsonString,
                }}
            />
        </div>
    );
};

export default JsonPreviewer;
