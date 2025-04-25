import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { checkPermissionForModulesFeatureAccess } from "../../../../../utils/common";
import { Permission } from "../../../../../utils/enums";
import { useIntl } from "react-intl";

export const SidebarMenuMain = () => {
  const {formatMessage }= useIntl();
  const modulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission
  );
  const userModulePermission = modulePermission ?? [];

  const filteredTabList = SideBarTabList.map((tab) => {
    if(tab.isDefault){
      return tab;
    }
    if (tab.hasSubTabs) {
      const subTabsWithPermission = tab.subTabs?.filter((subTab) =>
        checkPermissionForModulesFeatureAccess(
          `${subTab.constant}.${Permission.View}`,
          userModulePermission
        )
      );

      if (subTabsWithPermission && subTabsWithPermission.length > 0) {
        return {
          ...tab,
          subTabs: subTabsWithPermission,
        };
      }
      return null;
    }
    if (
      checkPermissionForModulesFeatureAccess(
        `${tab.constant}.${Permission.View}`,
        userModulePermission
      )
    ) {
      return tab;
    }
    return null;
  }).filter((tab) => tab !== null);

  if (filteredTabList.length === 0) {
    return null;
  }

  return (
    <>
      {filteredTabList.map((tab) => {
        if (tab?.hasSubTabs) {
          return (
            <SidebarMenuItemWithSub
              key={tab?.id}
              to={tab?.route}
              title={formatMessage({id:tab?.title})}
              icon={tab?.icon}
            >
              {tab?.subTabs?.map((subTab) => {
                return (
                  <SidebarMenuItem
                    key={subTab?.id}
                    to={subTab?.route}
                    title={formatMessage({id:subTab?.title})}
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
              title={formatMessage({id:tab.title})}
            />
          );
        }
      })}
    </>
  );
};
