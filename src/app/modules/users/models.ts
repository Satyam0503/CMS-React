import dayjs, { Dayjs } from "dayjs";
import { EmployeeModel, ResponseData } from "../../../utils/common_types";

export type UploadProfileResponseModel = ResponseData<string>

export interface ProfileProps {
  employeeId: string;
}

export type SkillModel = {
  id: string;
  name: string;
}

export type UserSkillsModel = {
  id: string;
  userId: string;
  skills: SkillModel[];
};

export type EditEmployeePayloadModel = Pick<EmployeeModel,
  "firstName" | "lastName" | "email" | "phoneNumber" | "dateOfBirth" | "dateOfJoining" | "personalEmail" | "emergencyContact"
  | "bloodGroup" | "address" | "reportingManager" | "teamLead" | "department" | "jobRole">



export type EmployeeByIdResponse = EmployeeModel & {
  departmentName: string | null;
  reportingManagerName: string | null;
  teamLeadName: string | null;
}

export type EmployeeResponseData = ResponseData<EmployeeByIdResponse>;
export type GetSkillListResponseModel = ResponseData<SkillModel>;
export type UserSkillsResponseData = ResponseData<UserSkillsModel>;
