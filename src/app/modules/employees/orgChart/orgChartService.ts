import { getRequest } from "../../../../server/axios";
import { ServiceUrl } from "../../../../utils/constant/data";
import { OrgChartNode, OrgChartResponse } from "./orgChartModel";

export const getReportingChain = async (userId: string): Promise<OrgChartNode[]> => {
  if (!userId || !userId.trim()) return [];
  const url = `${ServiceUrl.GET_REPORTING_CHAIN}?userId=${encodeURIComponent(userId.trim())}`;
  const response = await getRequest<any>(url);
  const raw: any = response?.data;
  const payload: any = raw?.methodResult ?? raw?.data ?? raw;
  return Array.isArray(payload) ? payload : [];
};

export const getOrganizationChart = async (
  departmentId?: string,
  search?: string,
): Promise<OrgChartResponse> => {
  const params = new URLSearchParams();
  if (departmentId && departmentId !== "ALL") {
    params.append("departmentId", departmentId);
  }
  if (search && search.trim()) {
    params.append("search", search.trim());
  }

  const query = params.toString();
  const url = query
    ? `${ServiceUrl.GET_ORGANIZATION_CHART}?${query}`
    : ServiceUrl.GET_ORGANIZATION_CHART;

  const response = await getRequest<any>(url);
  const raw: any = response?.data;
  const payload: any = raw?.methodResult ?? raw?.data ?? raw;

  return {
    roots: Array.isArray(payload?.roots) ? payload.roots : [],
    totalEmployeesCount: typeof payload?.totalEmployeesCount === "number" ? payload.totalEmployeesCount : 0,
    totalDepartmentsCount: typeof payload?.totalDepartmentsCount === "number" ? payload.totalDepartmentsCount : 0,
    departments: Array.isArray(payload?.departments) ? payload.departments : [],
  };
};
