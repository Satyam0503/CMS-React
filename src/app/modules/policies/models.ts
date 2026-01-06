import { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";

export type PolicyFolderStructure= {
  policyId?: string;
  policyName: string;
  description: string
  departments: Array<string>
  roles: Array<string>
  isActive: boolean;

};

export interface PolicyVersionStructure{
  id?: string,
  policyId?: string,
  versionName: string
  policyDoc: File | null,
  isCurrent: boolean,
}

export interface PolicyResponseStructure{
  policyDocUrl: string,
  versionName: string,
  id:string,
  isCurrent: boolean,
}

export type AddPolicyModel =PolicyFolderStructure;
export type PolicyResponseModel = ResponseData<PolicyVersionStructure>