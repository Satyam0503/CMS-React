import { Dayjs } from "dayjs";
import { Nullable, ResponseData } from "../../../utils/common_types";
import { initialPayRollValues } from "./payrollDefaults";

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
  deductionLines?: { code: string; description: string; amount: number; dayFraction?: number; sourceId?: string | null }[];
  earningLines?: { code: string; description: string; amount: number }[];
  isProcessed: boolean;
  workflowStatus?: string;
  approvalStatus?: string;
  paymentStatus?: string;
  paymentReference?: string;
  closedAt?: string;
  closedBy?: string;
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


export type PayrollAuditEventModel = { action: string; actorId: string; occurredAtUtc: string; notes?: string | null };

export type PayrollRunModel = { id: string; companyId: string; periodStart: string; periodEnd: string; payDate: string; runType: string; status: string; populationType: string; departmentId?: string | null; payGroupId?: string | null; employeeCount: number; readyCount: number; blockedCount: number; skippedCount: number; grossTotal: number; deductionTotal: number; netTotal: number; legacyPayrollRowsSynchronizedAtUtc?: string | null; createdAtUtc: string; };
export type PayrollRunReviewModel = { runId: string; status: string; employeeCount: number; calculatedCount: number; blockedCount: number; skippedCount: number; grossTotal: number; deductionTotal: number; netTotal: number; isReviewed: boolean; canApprove: boolean; blockingEmployeeIds: string[] };
export type PayrollRunEmployeeModel = { employeeId: string; status: string; inclusionReason?: string | null; exclusionReason?: string | null; errorMessage?: string | null };
export type PayrollAdjustmentModel = { id: string; originalPayrollRunId: string; correctionPayrollRunId?: string | null; employeeId: string; componentCode?: string | null; componentName?: string | null; componentKind?: string | null; isTaxable?: boolean | null; componentVersion?: number | null; targetPeriod?: string | null; type: string; status: string; amount: number; reason: string; createdBy?: string | null; createdAtUtc: string; approvedBy?: string | null; approvedAtUtc?: string | null; rejectedBy?: string | null; rejectedAtUtc?: string | null; rejectionReason?: string | null; processedBy?: string | null; processedAtUtc?: string | null };
export type PayrollAdjustmentComponentModel = Pick<PayrollSalaryComponentModel, "code" | "name" | "kind" | "isTaxable" | "version">;
export type CreatePayrollRunPayload = { periodStart: string; periodEnd: string; payDate: string; runType: string; populationType: string; departmentId?: string; payGroupId?: string; employeeIds?: string[]; idempotencyKey?: string; };

export type PayrollReportQuery = {
  from?: string;
  to?: string;
  status?: string;
  runType?: string;
  payGroupId?: string;
  employeeId?: string;
  lineStatus?: string;
};

export type PayrollReportStatusTotalModel = {
  status: string;
  runCount: number;
  employeeCount: number;
  blockedCount: number;
  skippedCount: number;
  grossTotal: number;
  deductionTotal: number;
  netTotal: number;
};

export type PayrollReportSummaryModel = {
  from?: string | null;
  to?: string | null;
  runCount: number;
  employeeCount: number;
  blockedCount: number;
  skippedCount: number;
  grossTotal: number;
  deductionTotal: number;
  netTotal: number;
  statusTotals: PayrollReportStatusTotalModel[];
};

export type PayrollRegisterRowModel = {
  runId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  runType: string;
  runStatus: string;
  employeeId: string;
  departmentId?: string | null;
  payGroupId?: string | null;
  lineStatus: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
};

export type PayrollPolicyProfileModel = {
  id?: string;
  name: string;
  version: number;
  divisorPolicy: "CALENDAR_DAYS" | "WORKING_DAYS" | "FIXED_30_DAYS";
  requireAttendanceLock: boolean;
  epfMode: "EXEMPT" | "CAPPED_CEILING" | "ACTUAL_BASIC_12";
  epfWageCeiling: number;
  esicMode: "EXEMPT" | "STATUTORY";
  esicWageCeiling: number;
  tdsMode: "AUTO_NEW_REGIME" | "AUTO_OLD_REGIME" | "MANUAL_ONLY";
  statutoryJurisdiction: string;
  financialYear: string;
  statutoryRuleVersion: string;
  approvalStatus?: "DRAFT" | "SUBMITTED" | "APPROVED" | string;
  submittedBy?: string | null;
  submittedAtUtc?: string | null;
  approvedBy?: string | null;
  approvedAtUtc?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type PayrollStatutoryRegisterRowModel = {
  runId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  runType: string;
  runStatus: string;
  employeeId: string;
  policyProfileId?: string | null;
  policyProfileVersion: number;
  employeeEpf: number;
  employerEpf: number;
  employeeEsic: number;
  employerEsic: number;
  incomeTax: number;
  professionalTax: number;
  totalEmployeeStatutory: number;
};
export type PayrollSalaryComponentModel = {
  id?: string;
  code: string;
  name: string;
  kind: "EARNING" | "DEDUCTION";
  calculationType: "FIXED" | "PERCENT_OF_GROSS" | "PERCENT_OF_COMPONENT";
  baseComponentCode?: string | null;
  isTaxable: boolean;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  version: number;
};

export type PayrollSalaryTemplateComponentModel = {
  componentId?: string | null;
  code: string;
  name: string;
  kind: "EARNING" | "DEDUCTION";
  calculationType: string;
  baseComponentCode?: string | null;
  value: number;
  isTaxable: boolean;
  sortOrder: number;
};

export type PayrollSalaryTemplateModel = {
  id?: string;
  sourceTemplateId?: string | null;
  sourceTemplateVersion?: number | null;
  isRetired?: boolean;
  retiredBy?: string | null;
  retiredAtUtc?: string | null;
  name: string;
  basicPay?: number | null;
  hra?: number | null;
  lta?: number | null;
  otherAllowance?: number | null;
  bonus?: number | null;
  payGroupId?: string | null;
  departmentId?: string | null;
  employeeType?: string | null;
  gradeId?: string | null;
  components: PayrollSalaryTemplateComponentModel[];
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  version: number;
};

export type PayrollPayGroupModel = {
  id?: string;
  name: string;
  schedule: string;
  legalEntityId?: string | null;
  policyProfileId?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  version: number;
};



export type EmployeeSalaryComponentValueModel = {
  componentCode: string;
  componentName: string;
  kind: "EARNING" | "DEDUCTION";
  value: number;
  percentage?: number | null;
  calculationType: string;
  baseComponentCode?: string | null;
  isTaxable: boolean;
  isRecurring: boolean;
  isStatutory: boolean;
  isEmployerContribution: boolean;
};

export type EmployeeSalaryStructureModel = {
  id?: string;
  employeeId: string;
  userId?: string | null;
  offerId?: string | null;
  offerVersion?: number | null;
  salaryTemplateId?: string | null;
  payGroupId?: string | null;
  employeeType?: string | null;
  gradeId?: string | null;
  departmentId?: string | null;
  currency: string;
  paymentFrequency: string;
  annualCtc?: number | null;
  annualCtcSource?: string | null;
  monthlyGross?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: string;
  approvalStatus: string;
  source: string;
  version: number;
  submittedBy?: string | null;
  components: EmployeeSalaryComponentValueModel[];
};

export type EmployeePayrollAssignmentModel = {
  id?: string;
  employeeId: string;
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAtUtc?: string | null;
  payGroupId?: string | null;
  salaryTemplateId?: string | null;
  policyProfileId?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
};

export type EmployeeSalaryImportRowModel = Omit<EmployeeSalaryStructureModel, "id" | "status" | "approvalStatus" | "source" | "version"> & { rowNumber: number };
export type EmployeeSalaryImportPreviewRowModel = { rowNumber: number; employeeId: string; isValid: boolean; errors: string[] };

export type EmployeeSalaryImportBatchModel = {
  batchId: string;
  status: "PROCESSING" | "COMPLETED" | "PARTIAL_FAILURE" | string;
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  failedRowNumber?: number | null;
  failureMessage?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};
export type EmployeeSalaryPdfImportParseResult = {
  row?: EmployeeSalaryImportRowModel | null;
  errors: string[];
};
