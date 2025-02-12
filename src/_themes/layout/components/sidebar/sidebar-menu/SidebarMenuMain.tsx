import { useIntl } from "react-intl";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { checkUserModuleAccess } from "../../../../../utils/common";

const SidebarMenuMain = () => {
  const intl = useIntl();
  const userPermission = useAppSelector((state) => state.user.userPermissions);

  const FilteredTabList = SideBarTabList.filter((tab) => {
    if (tab.hasSubTabs) {
      const filteredSubTabs = tab.subTabs?.filter(
        (subTab) => checkUserModuleAccess(subTab.title, userPermission) === true
      )!;
      if (filteredSubTabs?.length > 0) {
        return {
          ...tab,
          subTabs: filteredSubTabs,
        };
      }
    }
    return checkUserModuleAccess(tab.title, userPermission) === true;
  });
  return (
    <>
      {FilteredTabList.map((tab) => {
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
