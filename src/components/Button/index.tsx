import style from "./Button.module.scss";

interface ButtonType extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    btnType?: "primary" | "secondary";
    outlined?: boolean;
    loading?: boolean;
}

const Button = ({btnType = "secondary", outlined = false, loading = false, ...props}: ButtonType) => {
    const classes = [style.button];

    switch (btnType) {
        case "primary":
            classes.push(style.primary);
            break;
        case "secondary":
            classes.push(style.secondary);
            break;
    }

    if (outlined) classes.push(style.outlined);
    if (loading) classes.push(style.loading);

    return (
        <button {...props} className={classes.join(" ")} disabled={props.disabled || loading}>{props.children}</button>
    )
}

export default Button;