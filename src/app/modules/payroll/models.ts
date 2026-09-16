import { Dayjs } from "dayjs";
import { Nullable, ResponseData } from "../../../utils/common_types";
import { initialPayRollValues } from "./PayRollManagement";

export type PayRollDataModel = {
  payRollId?: string;
  employeeId: string;
  paidDate: Dayjs;
  basicPay: number;
  paidDays: number;
  bonus: number;
  hra: number;
  lta: number;
  otherAllowance: number;
  lossOfPayDays: number;
  lossOfPay: number;
  incomeTax: number;
  healthInsurance: number;
  epf: number;
  esic: number;
  isProcessed: boolean;
};

export type PayRollRequestModel = {
  payMonth: string;
  payData: PayRollDataModel[];
};

export type PayslipPayload = {
  year: number;
  month: number;
};

export type EmployeePayslipPayload = PayslipPayload & {
  employeeId: string;
};

export type PayRollResponseModel = {
  employeeId: string;
  employeeName: string;
  jobTitle: Record<string, string> | null;
  payData: Nullable<PayRollDataModel>;
};

export type AddUpdatePayRollPayload = Omit<typeof initialPayRollValues, "payMonth"> & { payMonth: string };

export type ProcessPayrollMonthPayload = {
  payMonth: string;
  employeeIds?: string[];
};

export type GetPayRollResponseModel = ResponseData<PayRollResponseModel>;
