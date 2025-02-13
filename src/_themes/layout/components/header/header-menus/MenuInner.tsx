import { useIntl } from "react-intl";
import { MenuItem } from "./MenuItem";
import { MenuInnerWithSub } from "./MenuInnerWithSub";
import { useAppSelector } from "../../../../../app/Redux/hooks";
import { SideBarTabList } from "../../../../../utils/constant/Constant";
import { checkUserModuleAccess } from "../../../../../utils/common";

export function MenuInner() {
  const intl = useIntl();
  const userPermissions = useAppSelector((state) => state.user.userPermissions);
  const filteredTabList = SideBarTabList.filter((tab) => {
    if (tab.hasSubTabs) {
      const filteredSubTabs = tab.subTabs?.filter(
        (subTab) =>
          checkUserModuleAccess(subTab.title, userPermissions) === true
      )!;

      if (filteredSubTabs?.length > 0) {
        return {
          ...tab,
          subTabs: filteredSubTabs,
        };
      }
      return false;
    }
    return checkUserModuleAccess(tab.title, userPermissions) === true;
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
