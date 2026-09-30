import { getBlobRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  AddUpdatePayRollPayload,
  EmployeePayslipPayload,
  GetPayRollResponseModel,
  PayRollRequestModel,
  PayslipPayload,
  ProcessPayrollMonthPayload,
  PayrollAuditEventModel,
  PayrollPolicyProfileModel,
  EmployeeSalaryStructureModel,
  PayrollStatutoryRegisterRowModel,
  PayrollSalaryComponentModel,
  PayrollSalaryTemplateModel,
  PayrollPayGroupModel,
  EmployeePayrollAssignmentModel,
  EmployeeSalaryImportRowModel,
  EmployeeSalaryImportPreviewRowModel,
} from "./models";

type GetPayRollPayload = {
  employeeName: string;
  payMonth: string;
};

export const validatePayrollData = (payload: PayRollRequestModel) =>
  postRequest<PayRollRequestModel, ResponseData<string>>(ServiceUrl.VALIDATE_PAYROLL, payload);

export const uploadEmpPayRollData = (payload: PayRollRequestModel) => {
  return postRequest<PayRollRequestModel, ResponseData<string>>(
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

// service for HR/admin to preview or download another employee's pay slip (e.g. from the payroll table)
export const generateEmployeePaySlip = (payload: EmployeePayslipPayload) => {
  return postRequest<EmployeePayslipPayload, Blob>(
    ServiceUrl.GENERATE_EMPLOYEE_PAY_SLIP,
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

export const approvePayrollMonth = (payload: { payMonth: string }) =>
  postRequest<{ payMonth: string }, ApiResponse>(ServiceUrl.APPROVE_PAYROLL_MONTH, payload);

export const processPayrollMonth = (payload: ProcessPayrollMonthPayload) =>
  postRequest<ProcessPayrollMonthPayload, ApiResponse>(
    ServiceUrl.PUBLISH_PAYROLL_MONTH,
    payload,
  );

export const closePayrollMonth = (payload: { payMonth: string }) =>
  postRequest<typeof payload, ApiResponse>(ServiceUrl.CLOSE_PAYROLL_MONTH, payload);

export const getPayrollAuditHistory = (payrollId: string) =>
  postRequest<{ payrollId: string }, ResponseData<PayrollAuditEventModel[]>>(ServiceUrl.GET_PAYROLL_AUDIT_HISTORY, { payrollId });

export const recordPayrollPayment = (payload: { payrollId: string; paymentMethod: string; paymentReference: string; paymentDate?: string; notes?: string }) =>
  postRequest<typeof payload, ApiResponse>(ServiceUrl.RECORD_PAYROLL_PAYMENT, payload);

export const addUpdateEmployeePayRoll = (payload: AddUpdatePayRollPayload) => {
  return postRequest<AddUpdatePayRollPayload, ApiResponse>(
    ServiceUrl.ADD_UPDATE_EMP_PAYROLL,
    payload
  );
};



export const createPayrollRun = (payload: CreatePayrollRunPayload) =>
  postRequest<CreatePayrollRunPayload, ResponseData<PayrollRunModel>>("api/payroll/runs", payload);

export const getPayrollRuns = () =>
  getRequest<PayrollRunModel[]>("api/payroll/runs");
import type { CreatePayrollRunPayload, PayrollRegisterRowModel, PayrollReportQuery, PayrollReportSummaryModel, PayrollRunModel } from "./models";

export const recordPayrollRunReview = (runId: string, comment?: string) =>
  postRequest<{ comment?: string }, ApiResponse>(`api/payroll/runs/${runId}/review`, { comment });
export const approvePayrollRun = (runId: string) =>
  postRequest<undefined, ApiResponse>(`api/payroll/runs/${runId}/approve`, undefined);
export const createPaymentBatch = (runId: string) =>
  postRequest<undefined, ApiResponse>(`api/payroll/payment-batches/from-run/${runId}`, undefined);
export const createPayrollAdjustment = (payload: { originalPayrollRunId: string; employeeId: string; type: "ARREARS" | "CORRECTION" | "REVERSAL"; amount: number; reason: string }) =>
  postRequest<typeof payload, ApiResponse>("api/payroll/adjustments", payload);
export type PayrollPaymentBatchModel = { id: string; payrollRunId: string; status: "DRAFT" | "SUBMITTED" | "RECONCILED"; providerReference?: string | null; employeeCount: number; totalNetAmount: number };
export const getPaymentBatch = (runId: string) => getRequest<PayrollPaymentBatchModel>(`api/payroll/payment-batches/from-run/${runId}`);
export const submitPaymentBatch = (batchId: string, providerReference: string) => postRequest<{ providerReference: string }, ApiResponse>(`api/payroll/payment-batches/${batchId}/submit`, { providerReference });
export const reconcilePaymentBatch = (batchId: string, note: string) => postRequest<{ note: string }, ApiResponse>(`api/payroll/payment-batches/${batchId}/reconcile`, { note });


export const calculatePayrollRun = (runId: string) =>
  postRequest<undefined, ApiResponse>(`api/payroll/runs/${runId}/calculate`, undefined);


const payrollReportQuery = (query: PayrollReportQuery) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, value); });
  return params.toString();
};

export const getPayrollReportSummary = (query: PayrollReportQuery) =>
  getRequest<ResponseData<PayrollReportSummaryModel>>(`api/payroll/reports/summary?${payrollReportQuery(query)}`);

export const getPayrollRegister = (query: PayrollReportQuery) =>
  getRequest<ResponseData<PayrollRegisterRowModel[]>>(`api/payroll/reports/register?${payrollReportQuery(query)}`);

export const getPayrollRegisterCsv = (query: PayrollReportQuery) =>
  getBlobRequest(`api/payroll/reports/register.csv?${payrollReportQuery(query)}`);

export const getPayrollPolicies = () =>
  getRequest<PayrollPolicyProfileModel[]>("api/payroll/configuration/policies");
export const savePayrollPolicy = (payload: PayrollPolicyProfileModel) =>
  postRequest<PayrollPolicyProfileModel, ApiResponse>("api/payroll/configuration/policies", payload);
export const submitPayrollPolicy = (policyId: string, version: number) =>
  postRequest<undefined, ApiResponse>(`api/payroll/configuration/policies/submit?policyId=${encodeURIComponent(policyId)}&version=${version}`, undefined);
export const approvePayrollPolicy = (policyId: string, version: number) =>
  postRequest<undefined, ApiResponse>(`api/payroll/configuration/policies/approve?policyId=${encodeURIComponent(policyId)}&version=${version}`, undefined);

export const getPayrollStatutoryRegister = (query: PayrollReportQuery) =>
  getRequest<ResponseData<PayrollStatutoryRegisterRowModel[]>>(`api/payroll/reports/statutory/register?${payrollReportQuery(query)}`);
export const getPayrollStatutoryRegisterCsv = (query: PayrollReportQuery) =>
  getBlobRequest(`api/payroll/reports/statutory/register.csv?${payrollReportQuery(query)}`);
export const getEmployeeSalaryHistory = (employeeId: string) =>
  getRequest<EmployeeSalaryStructureModel[]>(`api/payroll/configuration/employee-salaries/${encodeURIComponent(employeeId)}`);
export const saveEmployeeSalaryStructure = (payload: EmployeeSalaryStructureModel) =>
  postRequest<EmployeeSalaryStructureModel, ResponseData<EmployeeSalaryStructureModel>>("api/payroll/configuration/employee-salaries", payload);
export const submitEmployeeSalaryStructure = (id: string, version: number) =>
  postRequest<undefined, ApiResponse>(`api/payroll/configuration/employee-salaries/submit?id=${encodeURIComponent(id)}&version=${version}`, undefined);
export const approveEmployeeSalaryStructure = (id: string, version: number) =>
  postRequest<undefined, ApiResponse>(`api/payroll/configuration/employee-salaries/approve?id=${encodeURIComponent(id)}&version=${version}`, undefined);


export const getPayrollSalaryComponents = () => getRequest<PayrollSalaryComponentModel[]>("api/payroll/configuration/components");

export const getPayrollSalaryTemplates = () => getRequest<PayrollSalaryTemplateModel[]>("api/payroll/configuration/salary-templates");
export const getPayrollPayGroups = () => getRequest<PayrollPayGroupModel[]>("api/payroll/configuration/pay-groups");

export const getPayrollAssignments = () => getRequest<EmployeePayrollAssignmentModel[]>("api/payroll/configuration/assignments");
export const savePayrollAssignment = (payload: EmployeePayrollAssignmentModel) => postRequest<EmployeePayrollAssignmentModel, ApiResponse>("api/payroll/configuration/assignments", payload);
export const approvePayrollAssignment = (employeeId: string, effectiveFrom: string) => postRequest<undefined, ApiResponse>(`api/payroll/configuration/assignments/approve?employeeId=${encodeURIComponent(employeeId)}&effectiveFrom=${encodeURIComponent(effectiveFrom)}`, undefined);

export const previewEmployeeSalaryImport = (rows: EmployeeSalaryImportRowModel[]) => postRequest<EmployeeSalaryImportRowModel[], EmployeeSalaryImportPreviewRowModel[]>("api/payroll/configuration/employee-salaries/import/preview", rows);
export const submitEmployeeSalaryImport = (rows: EmployeeSalaryImportRowModel[], batchId?: string) => postRequest<EmployeeSalaryImportRowModel[], ApiResponse>(`api/payroll/configuration/employee-salaries/import${batchId ? `?batchId=${encodeURIComponent(batchId)}` : ""}`, rows);

export const getEmployeeSalaryImportBatch = (batchId: string) =>
  getRequest<import("./models").EmployeeSalaryImportBatchModel>(
    "api/payroll/configuration/employee-salaries/import/" + encodeURIComponent(batchId)
  );
export const previewEmployeeSalaryPdf = (file: File) => {
  const form = new FormData();
  form.append("pdf", file);
  return postRequest<FormData, import("./models").EmployeeSalaryPdfImportParseResult>(
    "api/payroll/configuration/employee-salaries/import/pdf/preview", form, undefined, true
  );
};