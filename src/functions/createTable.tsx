import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Checkbox from "@mui/material/Checkbox/Checkbox";
import Button from "../components/Button";
import Table from "../components/Table";
import { TableInitializationType, TableUIStartingType, TableUIType } from "../types/general";

const defaultUI: TableUIType = {
    PrimaryBtn: ({ onClick, loading, disabled, children, className }) => (
        <Button btnType={"primary"} onClick={onClick} loading={loading} disabled={disabled || loading} className={className}>
            {children}
        </Button>
    ),
    SecondaryBtn: ({ onClick, loading, disabled, children, className }) => (
        <Button
            btnType={"secondary"}
            onClick={onClick}
            loading={loading}
            disabled={disabled || loading}
            className={className}
        >
            {children}
        </Button>
    ),
    OutlinedBtn: ({ onClick, loading, disabled, children, className }) => (
        <Button onClick={onClick} loading={loading} disabled={disabled || loading} className={className} outlined>
            {children}
        </Button>
    ),
    Checkbox: ({ checked, onChange, disabled, className }) => (
        <Checkbox
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={className}
            icon={<VisibilityOffIcon />}
            checkedIcon={<VisibilityIcon />}
        />
    ),
};

const createTable =
    (useTableProps: TableUIStartingType = {} as TableUIStartingType) =>
    (tableInitializationProps: TableInitializationType) => {
        return <Table {...tableInitializationProps} UI={{ ...defaultUI, ...useTableProps }} />;
    };

export default createTable;
