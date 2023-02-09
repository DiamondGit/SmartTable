const URL = {
    create: "/users/user-config/create",
    get: (tableName: string) => `/users/user-config/by-user-id-and-table?tableName=${tableName}`,
    choose: "/users/user-config/choose-current-config",
    delete: "/users/user-config/delete",
    setDefault: "/users/user-config/set-default-config",
    update: "/users/user-config/update",
};

export default URL;
