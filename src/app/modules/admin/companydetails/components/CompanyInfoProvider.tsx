import { createContext, FC, ReactNode, useContext, useState } from "react"
import { CompanyInfoModel } from "../../models"

type PropTypes = {
    children: React.ReactNode;
};

type CompanyInfoContextType = {
    companyInfo: CompanyInfoModel,
}

const CompanyInfoContext = createContext<CompanyInfoContextType | undefined>(undefined);

export const CompanyInfoProvider: FC<PropTypes> = ({ children }) => {
    const [companyInfo, setCompanyInfo] = useState({} as CompanyInfoModel);
    return (
        <CompanyInfoContext.Provider value={{ companyInfo }}>
            {children}
        </CompanyInfoContext.Provider>
    )
}

export const useCompanyInfoContext = () => {
    const companyInfo = useContext(CompanyInfoContext);
    if (!companyInfo) {
        throw new Error("Company rDetails must be used within a CompanyDetailsProvider");
    }
    return companyInfo;
}