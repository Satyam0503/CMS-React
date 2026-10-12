import { describe, expect, it } from "vitest";
import { filterSideBarTabs } from "./common";
import { ModulesName, Roles } from "./enums";

const lifecycleRoute = "/lifecycle-management";

const lifecycleIsVisible = (permissions: string[]) =>
  filterSideBarTabs(permissions, Roles.HRManager)
    .flatMap((tab) => tab.subTabs ?? [])
    .some((tab) => tab.route === lifecycleRoute);

describe("lifecycle management navigation", () => {
  it("shows the payroll lifecycle tab to an HR manager with Employees.Edit", () => {
    expect(lifecycleIsVisible([`${ModulesName.Employees}.Edit`])).toBe(true);
  });

  it("does not expose lifecycle controls with view-only employee access", () => {
    expect(lifecycleIsVisible([`${ModulesName.Employees}.View`])).toBe(false);
  });
});
