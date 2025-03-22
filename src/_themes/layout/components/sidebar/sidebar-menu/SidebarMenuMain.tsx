import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { checkPermissionForModulesFeatureAccess } from "../../../../../utils/common";
import { Permission } from "../../../../../utils/enums";

export const SidebarMenuMain = () => {
  const modulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission
  );
  const userModulePermission = modulePermission ?? [];

  const filteredTabList = SideBarTabList.map((tab) => {
    if (tab.hasSubTabs) {
      const subTabsWithPermission = tab.subTabs?.filter((subTab) =>
        checkPermissionForModulesFeatureAccess(
          subTab.title,
          Permission.View,
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
        tab.title,
        Permission.View,
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
              title={tab?.title}
              icon={tab?.icon}
            >
              {tab?.subTabs?.map((subTab) => {
                return (
                  <SidebarMenuItem
                    key={subTab?.id}
                    to={subTab?.route}
                    title={subTab?.title}
                    icon={subTab?.icon}
                  />
                );
              })}
            </SidebarMenuItemWithSub>
          );
        }
        if(tab){
          return (
            <SidebarMenuItem
              key={tab.id}
              to={tab.route}
              icon={tab.icon}
              title={tab.title}
            />
          );
        }
      })}
    </>
  );
};

