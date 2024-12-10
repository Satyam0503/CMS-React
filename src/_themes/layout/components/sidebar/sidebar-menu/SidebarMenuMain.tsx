import { useIntl } from "react-intl";
import { KTIcon } from "../../../../helpers";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";

const SidebarMenuMain = () => {
  const intl = useIntl();

  return (
    <>
      <SidebarMenuItem
        to="/test"
        icon="element-11"
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        fontIcon="bi-app-indicator"
      />
      <SidebarMenuItem
        to="/myprofile"
        icon="element-11"
        title={intl.formatMessage({ id: "MENU.PROFILE" })}
        fontIcon="bi-app-indicator"
      />

      <SidebarMenuItem
        to="/dashboard"
        icon="element-11"
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        fontIcon="bi-app-indicator"
      />
      <SidebarMenuItem
        to="/builder"
        icon="switch"
        title={intl.formatMessage({ id: "MENU.LAYOUT_BUILDER" })}
        fontIcon="bi-layers"
      />
      <div className="menu-item">
        <div className="menu-content pt-8 pb-2">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1">
            Crafted
          </span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to="/crafted/pages"
        title="Pages"
        fontIcon="bi-archive"
        icon="element-plus"
      >
        <SidebarMenuItemWithSub
          to="/crafted/pages/profile"
          title="Profile"
          hasBullet={true}
        >
          <SidebarMenuItem
            to="/crafted/pages/profile/overview"
            title="Overview"
            hasBullet={true}
          />
          <SidebarMenuItem
            to="/crafted/pages/profile/projects"
            title="Projects"
            hasBullet={true}
          />
          <SidebarMenuItem
            to="/crafted/pages/profile/campaigns"
            title="Campaigns"
            hasBullet={true}
          />
          <SidebarMenuItem
            to="/crafted/pages/profile/documents"
            title="Documents"
            hasBullet={true}
          />
          <SidebarMenuItem
            to="/crafted/pages/profile/connections"
            title="Connections"
            hasBullet={true}
          />
        </SidebarMenuItemWithSub>
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to="/crafted/accounts"
        title="Accounts"
        icon="profile-circle"
        fontIcon="bi-person"
      >
        <SidebarMenuItem
          to="/crafted/account/overview"
          title="Overview"
          hasBullet={true}
        />
        <SidebarMenuItem
          to="/crafted/account/settings"
          title="Settings"
          hasBullet={true}
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to="/error"
        title="Errors"
        fontIcon="bi-sticky"
        icon="cross-circle"
      >
        <SidebarMenuItem to="/error/404" title="Error 404" hasBullet={true} />
        <SidebarMenuItem to="/error/500" title="Error 500" hasBullet={true} />
      </SidebarMenuItemWithSub>

      <div className="menu-item">
        <div className="menu-content pt-8 pb-2">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1">
            Apps
          </span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to="/apps/chat"
        title="Chat"
        fontIcon="bi-chat-left"
        icon="message-text-2"
      >
        <SidebarMenuItem
          to="/apps/chat/private-chat"
          title="Private Chat"
          hasBullet={true}
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItem
        to="/apps/user-management/users"
        icon="abstract-28"
        title="User management"
        fontIcon="bi-layers"
      />
    </>
  );
};

export { SidebarMenuMain };
