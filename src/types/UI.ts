import z from "zod";

interface UIBtnProps {
    loading?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

interface UICheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type UIBtnType = (props: UIBtnProps) => JSX.Element;
type UICheckBoxType = (props: UICheckboxProps) => JSX.Element;

export type TableUIStartingType = {
    PrimaryBtn?: UIBtnType;
    SecondaryBtn?: UIBtnType;
    OutlinedBtn?: UIBtnType;
    Checkbox?: UICheckBoxType;
};

export type TableUIType = {
    [Property in keyof TableUIStartingType]-?: TableUIStartingType[Property];
};