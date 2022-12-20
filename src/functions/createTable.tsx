import Checkbox from "@mui/material/Checkbox/Checkbox";
import Button from "../components/Button";
import Table, { TableType } from "../components/Table";
import { TableUIStartingType, TableUIType } from "../types/general";

const defaultUI: TableUIType = {
    PrimaryBtn: ({ onClick, loading, disabled, children }) => (
        <Button btnType={"primary"} onClick={onClick} disabled={disabled || loading}>
            {children}
        </Button>
    ),
    SecondaryBtn: ({ onClick, loading, disabled, children }) => (
        <Button btnType={"secondary"} onClick={onClick} disabled={disabled || loading}>
            {children}
        </Button>
    ),
    OutlinedBtn: ({ onClick, loading, disabled, children }) => (
        <Button onClick={onClick}>
            disabled={disabled || loading}
            {children}
        </Button>
    ),
    Checkbox: ({ checked, onChange }) => <Checkbox checked={checked} onChange={onChange} />,
};

const createTable =
    (useTableProps: TableUIStartingType = {} as TableUIStartingType) =>
    (tableProps: TableType) => {
        return <Table {...tableProps} UI={{ ...defaultUI, ...useTableProps }} />;
    };

export default createTable;
