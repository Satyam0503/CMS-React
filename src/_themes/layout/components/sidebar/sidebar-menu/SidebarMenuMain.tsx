import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { filterSideBarTabs } from "../../../../../utils/common";
import { useIntl } from "react-intl";
import { Box, Stack } from "@mui/material";
import { FC, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { checkIsActive } from "../../../../helpers";
import { ModulesTitles } from "../../../../../utils/enums";

type Props = {
  currentIndex: number | null;
  handleToggle: (index: number | null) => void;
  isMiniSidebar: boolean;
  onExpandSidebar?: () => void;
};

export const SidebarMenuMain: FC<Props> = ({
  currentIndex,
  handleToggle,
  isMiniSidebar,
  onExpandSidebar,
}) => {
  const { formatMessage } = useIntl();
  const getTabTitle = (titleKey?: string) => {
    if (!titleKey) return "";
    if (titleKey === ModulesTitles.LifecycleManagement || titleKey === "MODULES.LIFECYCLE_MANAGEMENT") {
      return "Employee Lifecycle";
    }
    return formatMessage({ id: titleKey });
  };
  const { pathname } = useLocation();
  const modulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission,
  );
  const userRoleType = useAppSelector(
    (state) => state.user.userData?.roleType!,
  );
  const filteredTabList = useMemo(
    () => filterSideBarTabs(modulePermission ?? [], userRoleType),
    [modulePermission, userRoleType],
  );

  // Automatically expand the parent menu group whose sub-route matches the active URL
  useEffect(() => {
    if (isMiniSidebar) return;
    const matchedParentIndex = filteredTabList.findIndex(
      (tab) =>
        tab?.hasSubTabs &&
        tab.subTabs?.some((subTab) => subTab?.route && checkIsActive(pathname, subTab.route)),
    );
    if (matchedParentIndex !== -1 && currentIndex !== matchedParentIndex) {
      handleToggle(matchedParentIndex);
    }
  }, [pathname, filteredTabList, isMiniSidebar]);

  if (filteredTabList.length === 0) {
    return null;
  }

  return (
    <Box
      className="sidebar-menu-main"
      sx={{
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        my: 0,
        overflowY: "auto",
      }}
    >
      <Stack sx={{ width: "100%", gap: 0.25 }}>
        {filteredTabList.map((tab, index) => {
          if (tab?.hasSubTabs) {
            const hasActiveChild = Boolean(
              tab.subTabs?.some((subTab) => subTab?.route && checkIsActive(pathname, subTab.route)),
            );
            return (
              <SidebarMenuItemWithSub
                index={index}
                key={tab?.id}
                to={tab?.route}
                isOpen={currentIndex === index}
                hasActiveChild={hasActiveChild}
                title={getTabTitle(tab?.title)}
                icon={tab?.icon}
                isMiniSidebar={isMiniSidebar}
                setCurrentMenuIndex={handleToggle}
                onExpandSidebar={onExpandSidebar}
              >
                {tab?.subTabs?.map((subTab) => {
                  return (
                    <SidebarMenuItem
                      key={subTab?.id}
                      to={subTab?.route}
                      title={getTabTitle(subTab?.title)}
                      icon={subTab?.icon}
                      isMiniSidebar={isMiniSidebar}
                    />
                  );
                })}
              </SidebarMenuItemWithSub>
            );
          }
          if (tab) {
            return (
              <SidebarMenuItem
                key={tab.id}
                to={tab.route}
                icon={tab.icon}
                title={getTabTitle(tab.title)}
                isMiniSidebar={isMiniSidebar}
              />
            );
          }
        })}
      </Stack>
    </Box>
  );
};
