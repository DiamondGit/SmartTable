import style from "./CenteredContainer.module.scss";

interface CenteredContainerType {
    children: any;
}

const CenteredContainer = ({children}: CenteredContainerType) => {
    return (
        <div className={style.container}>
            {children}
        </div>
    );
}

export default CenteredContainer;