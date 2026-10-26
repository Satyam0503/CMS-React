import { describe, expect, it } from "vitest";
import {
  buildWfhBusinessDateUrl,
  buildWfhHistoryUrl,
  findApprovedWfhRequestForBusinessDate,
  requestCoversBusinessDate,
  wfhHistoryLastPage,
} from "./wfhRequestHistory";

describe("WFH request history paging", () => {
  it("builds the requested employee history page", () => {
    expect(buildWfhHistoryUrl(3, 50)).toBe("api/wfh/requests/my?pageNo=3&pageSize=50");
  });

  it("keeps current-day lookup independent from paged history", () => {
    expect(buildWfhBusinessDateUrl("2026-10-26T00:00:00Z")).toBe(
      "api/wfh/requests/my?pageNo=1&pageSize=100&status=Approved&fromDate=2026-10-26&toDate=2026-10-26",
    );
  });

  it("returns at least one page and computes the final valid page", () => {
    expect(wfhHistoryLastPage(0, 25)).toBe(1);
    expect(wfhHistoryLastPage(51, 25)).toBe(3);
    expect(wfhHistoryLastPage(-1, 25)).toBe(1);
  });

  it("includes requests on both date boundaries", () => {
    expect(requestCoversBusinessDate({ fromDate: "2026-10-26T00:00:00Z", toDate: "2026-10-27" }, "2026-10-26")).toBe(true);
    expect(requestCoversBusinessDate({ fromDate: "2026-10-25", toDate: "2026-10-26" }, "2026-10-26T15:00:00Z")).toBe(true);
    expect(requestCoversBusinessDate({ fromDate: "2026-10-25", toDate: "2026-10-25" }, "2026-10-26")).toBe(false);
  });

  it("selects only an approved request covering today, even if other states appear first", () => {
    const pending = { requestId: "pending", status: "Pending", fromDate: "2026-10-26", toDate: "2026-10-26" };
    const approved = { requestId: "approved", status: "Approved", fromDate: "2026-10-25", toDate: "2026-10-27" };
    expect(findApprovedWfhRequestForBusinessDate([pending, approved], "2026-10-26")?.requestId).toBe("approved");
    expect(findApprovedWfhRequestForBusinessDate([pending], "2026-10-26")).toBeNull();
  });
});
