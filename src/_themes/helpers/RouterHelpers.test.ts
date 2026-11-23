import { describe, expect, it } from "vitest";
import { checkIsActive, getCurrentUrl } from "./RouterHelpers";

describe("RouterHelpers", () => {
  describe("getCurrentUrl", () => {
    it("strips queries and hash fragments", () => {
      expect(getCurrentUrl("/employees/org-chart?dept=1#tree")).toBe("/employees/org-chart");
    });
  });

  describe("checkIsActive", () => {
    it("correctly identifies exact route matches", () => {
      expect(checkIsActive("/employees", "/employees")).toBe(true);
      expect(checkIsActive("/employees/org-chart", "/employees/org-chart")).toBe(true);
      expect(checkIsActive("/lifecycle-management", "/lifecycle-management")).toBe(true);
    });

    it("prevents parent /employees from being active when on /employees/org-chart subtab", () => {
      expect(checkIsActive("/employees/org-chart", "/employees")).toBe(false);
      expect(checkIsActive("/employees/org-chart", "/employees/org-chart")).toBe(true);
    });

    it("allows /employees to be active when on employee details subroutes", () => {
      expect(checkIsActive("/employees/EMP-001", "/employees")).toBe(true);
      expect(checkIsActive("/employees/profile/EMP-001", "/employees")).toBe(true);
    });

    it("handles root and unrelated routes", () => {
      expect(checkIsActive("/", "/")).toBe(true);
      expect(checkIsActive("/dashboard", "/employees")).toBe(false);
      expect(checkIsActive("", "/employees")).toBe(false);
    });
  });
});

