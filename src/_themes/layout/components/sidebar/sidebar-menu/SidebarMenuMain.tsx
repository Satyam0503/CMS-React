import { useIntl } from "react-intl";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContactsIcon from "@mui/icons-material/Contacts";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FolderIcon from "@mui/icons-material/Folder";
import EmailIcon from "@mui/icons-material/Email";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SettingsIcon from "@mui/icons-material/Settings";

const SidebarMenuMain = () => {
  const intl = useIntl();

  return (
    <>
      <SidebarMenuItem
        to="/test"
        icon={<DashboardIcon />}
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
      />
      <SidebarMenuItem
        to="/employees"
        icon={<ContactsIcon />}
        title={intl.formatMessage({ id: "MENU.LAYOUT_BUILDER" })}
      />
      <SidebarMenuItem
        to="/Attendance"
        icon={<AccessTimeIcon />}
        title={intl.formatMessage({ id: "MENU.LAYOUT_BUILDER" })}
      />
      <SidebarMenuItem
        to="/LeaveManagement"
        icon={<PermContactCalendarIcon />}
        title={intl.formatMessage({ id: "MENU.LAYOUT_BUILDER" })}
      />
      <SidebarMenuItem
        to="/Projects"
        icon={<FolderIcon />}
        title={intl.formatMessage({ id: "MENU.LAYOUT_BUILDER" })}
      />
      <SidebarMenuItem
        to="/Clients"
        icon={<SwitchAccountIcon />}
        title={intl.formatMessage({ id: "MENU.LAYOUT_BUILDER" })}
      />
      <SidebarMenuItemWithSub
        to="/crafted/pages"
        title="Pages"
        fontIcon="bi-archive"
        icon={<PersonSearchIcon />}
      >
        <SidebarMenuItem
          to="/crafted/pages/profile/overview"
          title="Overview"
          icon={<FolderIcon />}
        />
        <SidebarMenuItem
          to="/crafted/pages/profile/overview"
          title="Overview"
          icon={<EmailIcon />}
        />
      </SidebarMenuItemWithSub>

      <SidebarMenuItem
        to="/crafted/pages/profile/overview"
        title="Overview"
        icon={<CalendarTodayIcon />}
      />
      <SidebarMenuItem
        to="/myprofile"
        title={intl.formatMessage({ id: "MENU.PROFILE" })}
        icon={<AccountCircleIcon />}
      />
      <SidebarMenuItem
        to="/crafted/account/settings"
        title="Settings"
        icon={<SettingsIcon />}
      />
           <SidebarMenuItem
        to="/employeeleave"
        title={intl.formatMessage({ id: 'MENU.LEAVE_MGMT' })}
        icon={<SettingsIcon />}
      />
    </>
  );
};

export { SidebarMenuMain };
