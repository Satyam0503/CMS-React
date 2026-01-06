
export type PolicyModel = {
  policyId?: string;
  policyName: string;
  description: string
  departments: Array<string>
  roles: Array<string>
  isActive: boolean;
};

export interface PolicyVersionModel {
  id?: string,
  policyId?: string,
  versionName: string,
  policyDoc: File | null,
  isCurrent: boolean,
}

export interface PolicyVersion {
  policyDocUrl: string,
  versionName: string,
  id: string,
  isCurrent: boolean,
}

export type AddPolicyModel = PolicyModel;