export const buildWfhHistoryUrl = (pageNo: number, pageSize: number) => {
  const query = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  return `api/wfh/requests/my?${query.toString()}`;
};

export const wfhHistoryLastPage = (totalRecords: number, pageSize: number) =>
  Math.max(1, Math.ceil(Math.max(0, totalRecords) / pageSize));
