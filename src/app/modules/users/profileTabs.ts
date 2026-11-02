import { TabModel } from "../../../utils/common_types";
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";

export const isLeaveTabEnabled = (modulePermissions: string[] = []) =>
  hasModuleFeaturePermission(
    ModulesName.LeaveManagement,
    Permission.View,
    modulePermissions,
  ) || modulePermissions.some((p) => p.startsWith("Leave_Management.") || p.startsWith("LeaveManagement."));

const createTabs = (modulePermissions: string[], empId?: string, roleType?: number): TabModel[] => {
  // The signed-in employee uses the dedicated self-service leave endpoints,
  // which do not require the admin Leave Management module permission.
  // Viewing another employee's leave remains protected by Leave Management.View.
  const isLeaveEnabled = !empId || isLeaveTabEnabled(modulePermissions);

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
      // If Leave Management is uninstalled for the company, the leave tracker is disabled entirely.
      // Otherwise, employees can view their own leave, and HR viewers can view other employees' leave.
      isActive: isLeaveEnabled,
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
      return isLeaveEnabled;
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
