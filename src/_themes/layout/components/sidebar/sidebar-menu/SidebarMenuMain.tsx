import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { filterSideBarTabs } from "../../../../../utils/common";
import { useIntl } from "react-intl";
import { Box, Stack } from "@mui/material";
import { FC, useMemo } from "react";

type Props = {
  currentIndex: number | null;
  handleToggle: (index: number | null) => void;
};

export const SidebarMenuMain: FC<Props> = ({ currentIndex, handleToggle }) => {
  const { formatMessage } = useIntl();
  const modulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission,
  );
  const userRoleType = useAppSelector(
    (state) => state.user.userData?.roleType!,
  );
  const userModulePermission = modulePermission ?? [];

  const filteredTabList = useMemo(
    () => filterSideBarTabs(userModulePermission, userRoleType),
    [userModulePermission],
  );

  if (filteredTabList.length === 0) {
    return null;
  }

  return (
    <Box className="sidebar-menu-main" sx={{ my: 2 }}>
      <Stack>
        {filteredTabList.map((tab, index) => {
          if (tab?.hasSubTabs) {
            return (
              <SidebarMenuItemWithSub
                index={index}
                key={tab?.id}
                to={tab?.route}
                isOpen={currentIndex ? index === currentIndex : false}
                title={formatMessage({ id: tab?.title })}
                icon={tab?.icon}
                setCurrentMenuIndex={handleToggle}
              >
                {tab?.subTabs?.map((subTab) => {
                  return (
                    <SidebarMenuItem
                      key={subTab?.id}
                      to={subTab?.route}
                      title={formatMessage({ id: subTab?.title })}
                      icon={subTab?.icon}
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
                title={formatMessage({ id: tab.title })}
              />
            );
          }
        })}
      </Stack>
    </Box>
  );
};
