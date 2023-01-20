import { ColumnType } from "../types/general";

interface SettingType {
    name: string;
    setting: ColumnType[];
}

const getStorageAddress = (tableIndex: string): string => {
    return `tableSettings ${tableIndex}`;
};

export const hasSettings = (tableIndex: string): boolean => {
    return getSettingAmount(tableIndex) > 0;
}

export const getSettingAmount = (tableIndex: string): number => {
    return getAllSettings(tableIndex).length;
};

export const getAllSettings = (tableIndex: string): SettingType[] => {
    try {
        return JSON.parse(localStorage.getItem(getStorageAddress(tableIndex)) || "[]");
    } catch (error) {
        return [];
    }
};

export const saveSetting = (tableIndex: string, settingName: string, setting: ColumnType[]) => {
    const currentTableSettings = getAllSettings(tableIndex);
    if (getSettingAmount(tableIndex) < 5) {
        currentTableSettings.push({
            name: settingName,
            setting: setting,
        });
    }
    localStorage.setItem(getStorageAddress(tableIndex), JSON.stringify(setting));
};
