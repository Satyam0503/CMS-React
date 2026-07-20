import { postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  CompanySalaryFilterPayload,
  CompanySalaryResponseModel,
  ProcessPayrollPayload,
} from "./model";

export const getCompanySalaries = (payload: CompanySalaryFilterPayload) => {
  return postRequest<
    CompanySalaryFilterPayload,
    ResponseData<CompanySalaryResponseModel>
  >(ServiceUrl.GET_COMPANY_SALARIES, payload);
};

export const processPayroll = (payload: ProcessPayrollPayload) => {
  return postRequest<ProcessPayrollPayload, ApiResponse>(
    ServiceUrl.PROCESS_PAYROLL,
    payload,
  );
};
