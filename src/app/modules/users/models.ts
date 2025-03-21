import { ResponseData } from "../../../utils/common_types";

export type UploadProfileResponseModel = ResponseData<string>

export interface ProfileProps {
    employeeId:string;
}