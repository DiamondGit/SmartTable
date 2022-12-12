import { TableColumnType, TableConfigType } from "../../types/general";
import style from "./JsonPreviewer.module.scss";

interface JsonPreviewerType {
    json: TableConfigType;
}

const JsonPreviewer = ({ json }: JsonPreviewerType) => {
    if (!json) return null;

    let jsonString = JSON.stringify(json, null, 2);

    const regexes = ["title", "dataIndex", "extra"];
    const regexColors = ["#ff8052", "#41e799", "#e7415d"];

    regexes.forEach((regex, index) => {
        jsonString = jsonString.replaceAll(
            JSON.stringify(regex) + ":",
            `<span style="color: ${regexColors[index % regexColors.length]}">${JSON.stringify(regex)}</span>:`
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
