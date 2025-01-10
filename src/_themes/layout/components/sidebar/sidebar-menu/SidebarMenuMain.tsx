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
import {
  AdminPanelSettings,
  ColorLens,
  Mail,
  ToggleOn,
  Work,
} from "@mui/icons-material";
import { CalendarIcon } from "@mui/x-date-pickers";

const SidebarMenuMain = () => {
  const intl = useIntl();

  return (
    <>
      <SidebarMenuItem
        to="/admindashboard"
        icon={<DashboardIcon />}
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
      />
      <SidebarMenuItem
        to="/userdashboard"
        icon={<DashboardIcon />}
        title={intl.formatMessage({ id: "User Dashboard" })}
      />
      <SidebarMenuItem
        to="/employees"
        icon={<ContactsIcon />}
        title={intl.formatMessage({ id: "MENU.EMP" })}
      />
      <SidebarMenuItem
        to="/attendance"
        icon={<AccessTimeIcon />}
        title={intl.formatMessage({ id: "MENU.ATTENDANCE" })}
      />
      <SidebarMenuItem
        icon={<PermContactCalendarIcon />}
        to="/employeeleave"
        title={intl.formatMessage({ id: "MENU.LEAVE_MGMT" })}
      />

      {/* <SidebarMenuItemWithSub
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
      </SidebarMenuItemWithSub> */}

      <SidebarMenuItem
        to="/myprofile"
        title={intl.formatMessage({ id: "MENU.PROFILE" })}
        icon={<AccountCircleIcon />}
      />

      <SidebarMenuItemWithSub
        to="/recruitment"
        title="Recruitment"
        icon={<PersonSearchIcon />}
      >
        <SidebarMenuItem
          to="/recruitment/jobs"
          icon={<Work />}
          title={intl.formatMessage({ id: "RECRUITMENT.JOBS" })}
        />
        <SidebarMenuItem
          to="/recruitment/applications"
          icon={<Mail />}
          title={intl.formatMessage({ id: "USER.APPLICATIONS" })}
        />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub
        to="/setting"
        title="Admin"
        icon={<SettingsIcon />}
      >
        <SidebarMenuItem
          to="/setting/permissions"
          icon={<ToggleOn />}
          title={intl.formatMessage({ id: "MENU.PERMISSIONS" })}
        />
        <SidebarMenuItem
          to="/setting/theme"
          icon={<ColorLens />}
          title={intl.formatMessage({ id: "MENU.THEME" })}
        />
      </SidebarMenuItemWithSub>

      <SidebarMenuItem
        to="/holidays"
        icon={<CalendarIcon />}
        title={intl.formatMessage({ id: "MENU.HOLIDAYS" })}
      />
      <SidebarMenuItem
        to="/noticeboard"
        icon={<AdminPanelSettings />}
        title={intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}
      />
    </>
  );
};

export { SidebarMenuMain };
