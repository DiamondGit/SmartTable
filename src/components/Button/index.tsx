import style from "./Button.module.scss";

interface ButtonType {
    onClick?: () => any,
    children: React.ReactNode;
}

const Button = ({onClick, children}: ButtonType) => {
    return (
        <button></button>
    )
}

export default Button;