import { Dayjs } from "dayjs";
import { postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  AddUpdatePayRollPayload,
  GetPayRollResponseModel,
  PayRollRequestModel,
  PayslipPayload,
} from "./models";

type GetPayRollPayload = {
  employeeName: string;
  payMonth: Dayjs;
};

export const uploadEmpPayRollData = (payload: PayRollRequestModel) => {
  return postRequest<PayRollRequestModel, ApiResponse>(
    ServiceUrl.UPLOAD_PAYROLL,
    payload
  );
};

// service to generate pay slip
export const generatePaySlip = (payload: PayslipPayload) => {
  return postRequest<PayslipPayload, Blob>(
    ServiceUrl.GENERATE_PAY_SLIP,
    payload,
    {
      responseType: "blob",
    }
  );
};

export const getEmployeePayRollData = (payload: GetPayRollPayload) => {
  return postRequest<GetPayRollPayload, GetPayRollResponseModel>(
    ServiceUrl.GET_PAYROLL_DATA,
    payload
  );
};

export const addUpdateEmployeePayRoll = (payload: AddUpdatePayRollPayload) => {
  return postRequest<AddUpdatePayRollPayload, ApiResponse>(
    ServiceUrl.ADD_UPDATE_EMP_PAYROLL,
    payload
  );
};
