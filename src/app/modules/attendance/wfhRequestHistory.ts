type RequestDateRange = { fromDate: string; toDate: string };

export const buildWfhHistoryUrl = (pageNo: number, pageSize: number) => {
  const query = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  return `api/wfh/requests/my?${query.toString()}`;
};

export const buildWfhBusinessDateUrl = (businessDate: string) => {
  const date = businessDate.slice(0, 10);
  const query = new URLSearchParams({
    pageNo: "1",
    pageSize: "100",
    status: "Approved",
    fromDate: date,
    toDate: date,
  });
  return `api/wfh/requests/my?${query.toString()}`;
};

export const wfhHistoryLastPage = (totalRecords: number, pageSize: number) =>
  Math.max(1, Math.ceil(Math.max(0, totalRecords) / pageSize));

export const requestCoversBusinessDate = (request: RequestDateRange, businessDate: string) => {
  const date = businessDate.slice(0, 10);
  return request.fromDate.slice(0, 10) <= date && request.toDate.slice(0, 10) >= date;
};

export const findApprovedWfhRequestForBusinessDate = <T extends RequestDateRange & { status: string }>(
  requests: T[],
  businessDate: string,
) => requests.find((request) =>
  request.status === "Approved" && requestCoversBusinessDate(request, businessDate)) ?? null;
