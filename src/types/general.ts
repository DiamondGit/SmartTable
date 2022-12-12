export interface TableColumnType {
    title: string;
    dataIndex: string;
    [key: string]: any;
};

export interface TableConfigType {
    table: TableColumnType[];
    [key: string]: any;
}