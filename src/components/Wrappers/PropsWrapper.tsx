import PropsContext from "../../context/PropsContext";
import { TableInitializationType } from "../../types/general";

interface PropsWrapperType {
    children: React.ReactNode;
    props: TableInitializationType;
}

const PropsWrapper = ({children, props}: PropsWrapperType) => {
    return (
        <PropsContext.Provider value={props}>
            {children}
        </PropsContext.Provider>
    )
}

export default PropsWrapper;