import { deleteRequest, getRequest, postRequest } from "../../../server/axios"
import { ApiResponse, ResponseData } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"
import { AddPolicyModel, PolicyFolderStructure, PolicyResponseModel, PolicyResponseStructure, PolicyVersionStructure } from "./models"

export const getAllPolicies = ()=>{
    return getRequest<ResponseData<PolicyFolderStructure>>(ServiceUrl.GET_POLICIES)
}

export const addPolicy = (payload: AddPolicyModel)=>{
    return postRequest<AddPolicyModel, ApiResponse>(ServiceUrl.ADD_POLICY, payload)
}

export const updatePolicy = (payload: PolicyFolderStructure)=>{
    return postRequest<PolicyFolderStructure, ApiResponse>(ServiceUrl.EDIT_POLICY, payload)
}

export const createPolicyVersion = (payload: FormData) => {
  return postRequest<FormData, PolicyResponseModel>(
    ServiceUrl.CREATE_POLICY_VERSION,
    payload,
    {},
    true
  );
};

export const editPolicyVersion = (payload: FormData)=>{
    return postRequest<FormData, ApiResponse>(ServiceUrl.EDIT_POLICY_VERSION, payload,{}, true)
}

export const getAllPolicyVersions = (policyId: string)=>{
    return getRequest<ResponseData<PolicyResponseStructure>>(`${ServiceUrl.GET_ALL_POLICY_VERSION}/${policyId}`)
}

export const deletePolicy = (policyId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_POLICY}/${policyId}`
  );
};

export const deletePolicyVersion = (policyVersionId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_POLICY_VERSION}/${policyVersionId}`
  );
};