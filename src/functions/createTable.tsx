import Table from "../components/Table";
import { TableCreateType, TableInitializationType } from "../types/general";

const createTable =
    ({ ...props }: TableCreateType) =>
    (tableInitializationProps: TableInitializationType) => {
        return <Table {...props} {...tableInitializationProps} />;
    };

export default createTable;
