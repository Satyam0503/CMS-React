import { AxiosResponse } from "axios";
import { ServiceUrl } from "../../../Constant"
import { getRequest, postRequest } from "../../../server/axios"
import { AddUpdateSummaryResponseData, EmployeesDataTypes, GetEmployeeDetailsResponseData } from "../../../utils/common_types";
import { Token } from "@mui/icons-material";

type AddUpdatePayload ={
    summary:string;
}

export const getUserDetails = async (id:string,token:string): Promise<AxiosResponse<GetEmployeeDetailsResponseData>> =>{
    return getRequest(`${ServiceUrl.GET_EMPLOYEE_DETAILS}:${id}`,{},token);
}

export const updateUserAvatar = async(payload:FormData,token:string)=>{
    return postRequest(ServiceUrl.UPDATE_USER_AVATAR,payload,{},true,token);
}

export const addUpdateUserSummary = async(id:string,payload:AddUpdatePayload,token:string):Promise<AxiosResponse<AddUpdateSummaryResponseData,any>> =>{
    return postRequest(`${ServiceUrl.ADD_UPDATE_USER_SUMMARY}:${id}`,payload,{},false,token);
}