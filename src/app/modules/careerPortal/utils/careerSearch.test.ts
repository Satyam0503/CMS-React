import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCareerSession,
  getCareerSession,
  getCareerVisitorToken,
  setCareerSession,
} from "../hooks/useCareerVisitor";
import { buildCareerSearchParams, CareerSearchFilters } from "./careerSearch";

const filters: CareerSearchFilters = {
  location: "Pune",
  workplaceType: "Hybrid",
  employmentType: "",
  experienceMin: "2",
  department: "",
  industry: "Technology",
  skills: "React,TypeScript",
  datePostedDays: "",
  featured: true,
  urgentHiring: false,
  walkIn: false,
  sort: "newest",
};

describe("career portal browser state", () => {
  beforeEach(() => localStorage.clear());

  it("creates one opaque visitor token and reuses it", () => {
    const first = getCareerVisitorToken();
    expect(first.length).toBeGreaterThanOrEqual(16);
    expect(getCareerVisitorToken()).toBe(first);
  });

  it("stores and clears the verified career session separately", () => {
    setCareerSession("opaque-session");
    expect(getCareerSession()).toBe("opaque-session");
    clearCareerSession();
    expect(getCareerSession()).toBe("");
  });
});

describe("career search query", () => {
  it("keeps active filters, paging, and omits inactive values", () => {
    const params = buildCareerSearchParams("  engineer  ", 0, filters);
    expect(params).toMatchObject({
      search: "engineer",
      pageNo: 1,
      pageSize: 12,
      location: "Pune",
      featured: true,
      skills: "React,TypeScript",
    });
    expect(params).not.toHaveProperty("urgentHiring");
    expect(params).not.toHaveProperty("employmentType");
  });
});
