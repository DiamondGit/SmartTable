import PropsContext from "../../context/PropsContext";
import { TableInitializationType } from "../../types/general";

interface PropsProviderType {
    children: React.ReactNode;
    props: TableInitializationType;
}

const PropsProvider = ({children, props}: PropsProviderType) => {
    return (
        <PropsContext.Provider value={props}>
            {children}
        </PropsContext.Provider>
    )
}

export default PropsProvider;