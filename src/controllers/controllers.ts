import _tableConfig_ from "../config/table.json";
import _tableData_ from "../config/data.json";

export const getTableConfig = async (tableName: string, userId: number): Promise<{
    defaultTableConfig: {},
    savedTableConfigs: any[],
}> => {
    return await new Promise((resolve, reject) => {
        const dataToSend = {
            defaultTableConfig: _tableConfig_,
            savedTableConfigs: [],
        };

        return setTimeout(() => resolve(dataToSend), 500);
    });
};

export const getTableData = async (tableName: string, userId: number): Promise<any[]> => {
    return await new Promise((resolve, reject) => {
        return setTimeout(() => resolve(_tableData_), 1500);
    });
};
