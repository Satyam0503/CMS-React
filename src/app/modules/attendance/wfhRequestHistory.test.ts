import { describe, expect, it } from "vitest";
import {
  buildWfhHistoryUrl,
  wfhHistoryLastPage,
} from "./wfhRequestHistory";

describe("WFH request history paging", () => {
  it("builds the requested employee history page", () => {
    expect(buildWfhHistoryUrl(3, 50)).toBe("api/wfh/requests/my?pageNo=3&pageSize=50");
  });

  it("returns at least one page and computes the final valid page", () => {
    expect(wfhHistoryLastPage(0, 25)).toBe(1);
    expect(wfhHistoryLastPage(51, 25)).toBe(3);
    expect(wfhHistoryLastPage(-1, 25)).toBe(1);
  });

});
