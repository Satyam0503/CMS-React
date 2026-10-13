import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  AddPolicyModel,
  PolicyModel,
  PolicyVersion,
  PolicyVersionModel,
} from "./models";
import axios from "axios";

export const getAllPolicies = () => {
  return getRequest<ResponseData<PolicyModel>>(ServiceUrl.GET_POLICIES);
};

export const addPolicy = (payload: AddPolicyModel) => {
  return postRequest<AddPolicyModel, ApiResponse>(
    ServiceUrl.ADD_POLICY,
    payload,
  );
};

export const updatePolicy = (payload: PolicyModel) => {
  return postRequest<PolicyModel, ApiResponse>(ServiceUrl.EDIT_POLICY, payload);
};

export const createPolicyVersion = (payload: FormData) => {
  return postRequest<FormData, ResponseData<PolicyVersionModel>>(
    ServiceUrl.CREATE_POLICY_VERSION,
    payload,
    {},
    true,
  );
};

export const editPolicyVersion = (payload: FormData) => {
  return postRequest<FormData, ApiResponse>(
    ServiceUrl.EDIT_POLICY_VERSION,
    payload,
    {},
    true,
  );
};

export const setCurrentPolicyVersion = (policyId: string, versionId: string) => {
  return postRequest<{ policyId: string; versionId: string }, ResponseData<PolicyVersion>>(
    ServiceUrl.SET_CURRENT_POLICY_VERSION,
    { policyId, versionId },
  );
};

export const getAllPolicyVersions = (policyId: string) => {
  return getRequest<ResponseData<PolicyVersion>>(
    `${ServiceUrl.GET_ALL_POLICY_VERSION}/${policyId}`,
  );
};

export const deletePolicy = (policyId: string) => {
  return deleteRequest<ApiResponse>(`${ServiceUrl.DELETE_POLICY}/${policyId}`);
};

export const deletePolicyVersion = (policyVersionId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_POLICY_VERSION}/${policyVersionId}`,
  );
};

export const getPolicyDocument = async (policyVersionId: string) => {
  return getRequest<ArrayBuffer>(
    `${ServiceUrl.GET_POLICY_DOCUMENT}/${policyVersionId}`,
    {
      responseType: "arraybuffer",
    },
  );
};
