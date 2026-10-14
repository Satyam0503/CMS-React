import { SalaryModel } from "../employees/models";

export type CompanySalaryResponseModel = {
  userId: string;
  employeeId: string;
  employeeName: string;
  dateOfJoining?: string | null;
  jobTitle: Record<string, string> | null;
  activeSalary: SalaryModel | null;
  lifecyclePayrollStatus?: string;
};

export type CompanySalaryFilterPayload = {
  employeeName: string;
};

export type ProcessPayrollPayload = {
  // date-only (YYYY-MM-DD), not a Dayjs/Date object - serializing a Dayjs here would
  // convert through UTC and can shift the 1st of the month into the previous month
  // for any positive UTC-offset timezone (e.g. IST), silently processing the wrong month
  payMonth: string;
};
