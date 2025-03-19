import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { checkPermissionForModuleAndRoute } from "../../../../../utils/common";

const SidebarMenuMain = () => {
  const userModulePermission = useAppSelector((state) => state.user.userPermissions);

  const filteredTabList = SideBarTabList.filter((tab) => {
    if (tab.hasSubTabs) {
      const filteredSubTabs = tab.subTabs?.filter(
        (subTab) => checkPermissionForModuleAndRoute(subTab.title, userModulePermission) === true
      )!;

      if (filteredSubTabs?.length > 0) {
        tab.subTabs=filteredSubTabs
        return true;
      }
      return false;
    }
    return checkPermissionForModuleAndRoute(tab.title, userModulePermission) === true;
  });
  
  return (
    <>
      {filteredTabList.map((tab) => {
        if (tab.hasSubTabs) {
          return (
            <SidebarMenuItemWithSub
              key={tab.id}
              to={tab.route}
              title={tab.title}
              icon={tab.icon}
            >
              {tab.subTabs?.map((subTab) => {
                return (
                  <SidebarMenuItem
                    key={subTab.id}
                    to={subTab.route}
                    title={subTab.title}
                    icon={subTab.icon}
                  />
                );
              })}
            </SidebarMenuItemWithSub>
          );
        }
        return (
          <SidebarMenuItem
            key={tab.id}
            to={tab.route}
            icon={tab.icon}
            title={tab.title}
          />
        );
      })}
    </>
  );
};

export { SidebarMenuMain };
