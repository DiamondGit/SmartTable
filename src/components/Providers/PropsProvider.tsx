import PropsContext from "../../context/PropsContext";
import { PropsContextType } from "../../types/general";

interface PropsProviderType {
    children: React.ReactNode;
    props: PropsContextType;
}

const PropsProvider = ({children, props}: PropsProviderType) => {
    return (
        <PropsContext.Provider value={props}>
            {children}
        </PropsContext.Provider>
    )
}

export default PropsProvider;