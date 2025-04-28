import { ResponseData } from "../../../utils/common_types";

export type UploadProfileResponseModel = ResponseData<string>

export interface ProfileProps {
    employeeId:string;
}

export type SkillModel ={
    id:string;
    name:string;
}

export type UserSkillsModel = {
  id: string;
  userId: string;
  skills: SkillModel[];
};

export type GetSkillListResponseModel = ResponseData<SkillModel>;
export type UserSkillsResponseData = ResponseData<UserSkillsModel>;
