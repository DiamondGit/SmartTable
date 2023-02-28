import axios from "axios";
import { CreateConfigType, UpdateConfigType } from "../types/general";
import CONFIG_URL from "./configURL";

const storageUser = localStorage.getItem("user");
const token = (storageUser && JSON.parse(storageUser)?.token) || "";

export const requester = axios.create({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export const getUserConfigs = async (tableName: string) => {
    return await requester.get(CONFIG_URL.get(tableName));
};

export const chooseConfig = async (tableName: string, userConfigId: number) => {
    return await requester.put(CONFIG_URL.choose, null, {
        params: {
            tableName,
            userConfigId,
        },
    });
};

export const createConfig = async (data: CreateConfigType) => {
    return await requester.post(CONFIG_URL.create, {
        ...{ ...data, configParams: JSON.stringify(data.configParams) },
    });
};

export const deleteConfig = async (userConfigId: number) => {
    return await requester.put(CONFIG_URL.delete, null, {
        params: { userConfigId },
    });
};

export const setDefaultConfig = async (tableName: string) => {
    return await requester.put(CONFIG_URL.setDefault, null, {
        params: { tableName },
    });
};

export const updateConfig = async (data: UpdateConfigType) => {
    return await requester.put(CONFIG_URL.update, {
        ...{ ...data, configParams: JSON.stringify(data.configParams) },
    });
};
