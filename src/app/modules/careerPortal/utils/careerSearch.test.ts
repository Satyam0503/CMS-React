import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCareerSession,
  getCareerSession,
  getCareerVisitorToken,
  setCareerSession,
} from "../hooks/useCareerVisitor";
import { buildCareerSearchParams, careerSearchErrorMessage, CareerSearchFilters, countActiveCareerFilters, shouldOfferCareerAlerts } from "./careerSearch";

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
  sort: "relevance",
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
  it("counts role filters but not result sorting as active filters", () => {
    expect(countActiveCareerFilters({ ...filters, sort: "newest", location: "", workplaceType: "", experienceMin: "", industry: "", skills: "", featured: false })).toBe(0);
    expect(countActiveCareerFilters({ ...filters, location: "", workplaceType: "", experienceMin: "", industry: "", skills: "", featured: false, sort: "salary-high" })).toBe(0);
    expect(countActiveCareerFilters({ ...filters, sort: "newest" })).toBe(6);
  });

  it("keeps active filters, paging, and omits inactive values", () => {
    const params = buildCareerSearchParams("  engineer  ", 0, filters);
    expect(params).toMatchObject({
      search: "engineer",
      pageNo: 1,
      pageSize: 12,
      location: "Pune",
      featured: true,
      skills: "React,TypeScript",
      sort: "relevance",
    });
    expect(params).not.toHaveProperty("urgentHiring");
    expect(params).not.toHaveProperty("employmentType");
  });

  it("explains network outages in candidate language and supports server messages", () => {
    expect(careerSearchErrorMessage({ message: "Network Error" })).toContain("Check your connection");
    expect(careerSearchErrorMessage({ message: "Request failed with status code 500", response: { status: 500 } }))
      .toBe("We couldn’t load job results right now. Please try again.");
    expect(careerSearchErrorMessage({ response: { data: { message: "Career site is paused." } } }))
      .toBe("Career site is paused.");
    expect(careerSearchErrorMessage({})).toBe("Jobs could not be loaded. Please try again.");
  });

  it("does not show job-alert signup while a job search is loading or unavailable", () => {
    expect(shouldOfferCareerAlerts({ loading: true, hasSearchError: false, alreadySeen: false, hasCandidateSession: false })).toBe(false);
    expect(shouldOfferCareerAlerts({ loading: false, hasSearchError: true, alreadySeen: false, hasCandidateSession: false })).toBe(false);
    expect(shouldOfferCareerAlerts({ loading: false, hasSearchError: false, alreadySeen: false, hasCandidateSession: false })).toBe(true);
  });
});
