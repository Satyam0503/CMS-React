import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { checkPermissionForModuleAndRoute } from "../../../../../utils/common";

const SidebarMenuMain = () => {
  const modulePermission = useAppSelector((state) => state.user.userData?.modulePermission);
  const userModulePermission = modulePermission  ?? [];
 
  const filteredTabList = SideBarTabList.map((tab)=>{
    if(tab.hasSubTabs){
      const subTabsWithPermission = tab.subTabs?.map(subTab=>{
        const hasAccess = checkPermissionForModuleAndRoute(subTab.title,userModulePermission);
        if(hasAccess){
          return subTab;
        }
        return null;
      }).filter(subTab=>subTab !== null);

      if(subTabsWithPermission && subTabsWithPermission.length>0){
        return {
          ...tab,
          subTabs:subTabsWithPermission
        }
      }
    }
    const hasModulePermission = checkPermissionForModuleAndRoute(tab.title,userModulePermission);
    if(hasModulePermission){
      return tab;
    }
    return null;
  }).filter(tab=>tab !==null);
    
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


// const filteredTabList = SideBarTabList
//   .map((tab) => {
//     if (tab.hasSubTabs) {
//       // Filter subTabs that the user has permission for
//       const subTabsWithPermission = tab.subTabs?.filter((subTab) => {
//         return checkPermissionForModuleAndRoute(subTab.title, userModulePermission);
//       });
      
//       // If there are any subTabs with permission, return the tab with filtered subTabs
//       if (subTabsWithPermission && subTabsWithPermission.length > 0) {
//         return {
//           ...tab,
//           subTabs: subTabsWithPermission
//         };
//       }
//     }

//     // Check permission for the current tab itself
//     const hasModulePermission = checkPermissionForModuleAndRoute(tab.title, userModulePermission);
//     if (hasModulePermission) {
//       return tab;
//     }

//     // Return null if no permission
//     return null;
//   })
//   // Remove null values or undefined from the array
//   .filter(tab => tab !== null);

