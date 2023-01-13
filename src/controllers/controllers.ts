import _tableData_ from "../config/data.json";
import _tableConfig_ from "../config/table.json";

interface GetTableConfigType {
    defaultTableConfig: {},
    savedTableConfigs: any[],
}

export const getTableConfig = async (tableName: string, userId: number): Promise<GetTableConfigType> => {
    return await new Promise((resolve, reject) => {
        let dataToSend: GetTableConfigType;

        dataToSend = {
            defaultTableConfig: _tableConfig_,
            savedTableConfigs: [],
        }

        return setTimeout(() => resolve(dataToSend), 500);
    });
};

export const getTableData = async (tableName: string, userId: number): Promise<any[]> => {
    return await new Promise((resolve, reject) => {
        return setTimeout(() => resolve(_tableData_), 1500);
    });
};
