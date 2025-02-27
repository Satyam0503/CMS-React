import { useIntl } from "react-intl";
import { MenuItem } from "./MenuItem";
import { MenuInnerWithSub } from "./MenuInnerWithSub";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { checkPermissionForModuleAndRoute } from "../../../../../utils/common";


export function MenuInner() {
  const intl = useIntl();
  const userModulePermissions = useAppSelector((state) => state.user.userPermissions);
  const filteredTabList = SideBarTabList.filter((tab) => {
    if (tab.hasSubTabs) {
      const filteredSubTabs = tab.subTabs?.filter(
        (subTab) =>
          checkPermissionForModuleAndRoute(subTab.title, userModulePermissions) === true
      )!;

      if (filteredSubTabs?.length > 0) {
        return {
          ...tab,
          subTabs: filteredSubTabs,
        };
      }
      return false;
    }
    return checkPermissionForModuleAndRoute(tab.title, userModulePermissions) === true;
  });
  return (
    <>
      {filteredTabList.map((tab) => {
        if (tab.hasSubTabs) {
          return (
            <MenuInnerWithSub
              key={tab.id}
              title={tab.title}
              to={tab.route}
              menuPlacement="bottom-start"
              menuTrigger="click"
            >
              {tab.subTabs?.map((subTab) => (
                <MenuItem
                  key={subTab.id}
                  to={subTab.route}
                  title={subTab.title}
                />
              ))}
            </MenuInnerWithSub>
          );
        }
        return <MenuItem key={tab.id} title={tab.title} to={tab.route} />;
      })}
    </>
  );
}
