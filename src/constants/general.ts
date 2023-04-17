export enum FLAG {
    colSpan = "_$colSpan$_",
    rowSpan = "_$rowSpan$_",
    rowLevel = "_$rowLevel$_",
    path = "_$path$_",
    namedDataIndex = "_$namedDataIndex$_",
    mainOrder = "_$mainOrder$_",
}

export const ACTION_COLUMN_NAME = "_$actionColumn$_";

export const INDEX_JOINER = "#";

export const DELETE_OPTION = "Delete";

export const ERR_CANCELED = "ERR_CANCELED";

export const CONFIG_DEFAULT_VALUE = "DEFAULT";

export const PLACEHOLDER = {
    loading: "Загрузка...",
    select: (count: number = 0) => `Выберите, доступно ${count}`,
    notSelected: "Не выбрано:",
};

export const MESSAGE = {
    success: {
        config: {
            apply: (configName: string) => `Настройка "${configName}" успешно применена`,
            updateApply: (configName: string) => `Настройка "${configName}" успешно изменена и применена`,
            default: "Успешно применена настройка по умолчанию",
            create: (configName: string) => `Настройка "${configName}" успешно сохранена`,
            update: (configName: string) => `Настройка "${configName}" успешно изменена`,
            delete: (configName: string) => `Настройка "${configName}" успешно удалена`,
        },
    },
    error: {
        general: "Произошла ошибка",
        create: "При создании произошла ошибка",
        update: "При изменении произошла ошибка",
        delete: "При удалении произошла ошибка",
        config: {
            apply: "Не удалось сохранить состояние таблицы",
        },
    },
};
