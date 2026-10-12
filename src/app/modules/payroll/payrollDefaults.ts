import dayjs, { Dayjs } from "dayjs";
import { Nullable } from "../../../utils/common_types";
import { PayRollDataModel } from "./models";

export const initialPayRollValues: Nullable<PayRollDataModel> & { payMonth: Dayjs } = {
  employeeId: "",
  paidDate: null,
  basicPay: null,
  paidDays: null,
  bonus: null,
  hra: null,
  lta: null,
  otherAllowance: null,
  lossOfPayDays: null,
  lossOfPay: null,
  incomeTax: null,
  healthInsurance: null,
  epf: null,
  esic: null,
  isProcessed: false,
  payMonth: dayjs().subtract(1, "month"),
};
