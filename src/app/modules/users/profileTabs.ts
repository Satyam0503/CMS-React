import { TabModel } from "../../../utils/common_types";
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";

const createTabs = (modulePermissions: string[], empId?: string, roleType?: number): TabModel[] => {
  const isLeaveEnabled = hasModuleFeaturePermission(
    ModulesName.LeaveManagement,
    Permission.View,
    modulePermissions,
  );

  const tabsRoutes: TabModel[] = [
    {
      tabId: 1,
      to: "about",
      title: "PROFILE.TABS.ABOUT",
      icon: null,
      isActive: true,
    },
    {
      tabId: 2,
      to: "leave",
      title: "PROFILE.TABS.LEAVE_TRACKER",
      icon: null,
      // Employees retain their own leave tracker; viewing another employee's
      // leave data remains restricted to Leave Management viewers.
      isActive: !empId || isLeaveEnabled,
    },
    {
      tabId: 3,
      to: "performance",
      title: "PROFILE.TABS.PERFORMANCE",
      icon: null,
      isActive: canAccessHrManagement(roleType),
    },
    {
      tabId: 4,
      to: "workhistory",
      title: "PROFILE.TABS.WORKHISTORY",
      icon: null,
      isActive: true,
    },
    {
      tabId: 5,
      to: "setting",
      title: "PROFILE.TABS.SETTING",
      icon: null,
      isActive: true,
    },
  ];

  return tabsRoutes.filter((tab) => {
    if (tab.to === "leave") {
      return !empId || isLeaveEnabled;
    }
    if (tab.to === "setting") {
      return !empId;
    }
    if (tab.to === "performance") {
      return canAccessHrManagement(roleType);
    }
    return true;
  });
};

export const getProfileTabs = (modulePermissions: string[] = [], empId?: string, roleType?: number) =>
  createTabs(modulePermissions, empId, roleType);

export const isLeaveTabEnabled = (modulePermissions: string[] = []) =>
  hasModuleFeaturePermission(
    ModulesName.LeaveManagement,
    Permission.View,
    modulePermissions,
  );
