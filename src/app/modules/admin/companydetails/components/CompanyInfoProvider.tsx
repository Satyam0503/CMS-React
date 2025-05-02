import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react"
import { CompanyInfoModel } from "../../models"
import { getCompanyDetails } from "../../adminservices";

type PropTypes = {
    children: React.ReactNode;
};

type CompanyInfoContextType = {
    companyInfo: CompanyInfoModel,
}

const CompanyInfoContext = createContext<CompanyInfoContextType | undefined>(undefined);

export const CompanyInfoProvider: FC<PropTypes> = ({ children }) => {
    const [companyInfo, setCompanyInfo] = useState({} as CompanyInfoModel);
    useEffect(() => {
        (async () => {
            const response = await getCompanyDetails();
            if (response.data.success) {
                setCompanyInfo(response.data.methodResult);
            }
        })();
    }, [])

    return (
        <CompanyInfoContext.Provider value={{ companyInfo }}>
            {children}
        </CompanyInfoContext.Provider>
    )
}

export const useCompanyInfoContext = () => {
    const companyInfo = useContext(CompanyInfoContext);
    if (!companyInfo) {
        throw new Error("Company Details must be used within a CompanyDetailsProvider");
    }
    return companyInfo;
}