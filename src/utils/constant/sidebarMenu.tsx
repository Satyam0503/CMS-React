import AccessTime from "@mui/icons-material/AccessTime";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Book from "@mui/icons-material/Book";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Contacts from "@mui/icons-material/Contacts";
import CurrencyRupee from "@mui/icons-material/CurrencyRupee";
import Info from "@mui/icons-material/Info";
import Mail from "@mui/icons-material/Mail";
import NoteAlt from "@mui/icons-material/NoteAlt";
import PermContactCalendar from "@mui/icons-material/PermContactCalendar";
import Person from "@mui/icons-material/Person";
import PersonSearch from "@mui/icons-material/PersonSearch";
import Settings from "@mui/icons-material/Settings";
import ToggleOn from "@mui/icons-material/ToggleOn";
import Work from "@mui/icons-material/Work";
import WebRounded from "@mui/icons-material/WebRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PolicyIcon from "@mui/icons-material/Policy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Modules, ModulesName, ModulesTitles } from "../enums";
import { SideBarTabListProps } from "../common_types";

export const SideBarTabList: SideBarTabListProps[] = [
  {
    id: Modules.Dashboard,
    title: ModulesTitles.Dashboard,
    constant: ModulesName.Dashboard,
    route: "/dashboard",
    icon: <DashboardIcon />,
    isDefault: true,
  },
  {
    id: Modules.Employees,
    constant: ModulesName.Employees,
    title: ModulesTitles.Employees,
    route: "/employees",
    icon: <Person />,
    isDefault: false,
  },
  {
    id: Modules.PayRoll,
    constant: ModulesName.PayRoll,
    title: ModulesTitles.PayRoll,
    route: "/",
    icon: <Contacts />,
    hasSubTabs: true,
    isDefault: false,
    subTabs: [
      {
        id: Modules.LeaveManagement,
        constant: ModulesName.LeaveManagement,
        title: ModulesTitles.LeaveManagement,
        route: "/leavemanagement",
        icon: <PermContactCalendar />,
        isDefault: false,
      },
      {
        id: Modules.Attendance,
        title: ModulesTitles.Attendance,
        constant: ModulesName.Attendance,
        route: "/attendance",
        icon: <AccessTime />,
        isDefault: false,
      },
      {
        id: Modules.PayRoll,
        title: ModulesTitles.PayRoll,
        constant: ModulesName.PayRoll,
        route: "/payroll",
        icon: <CurrencyRupee />,
        isDefault: false,
      },
      {
        id: Modules.PayrollSettings,
        title: ModulesTitles.PayrollSettings,
        constant: ModulesName.PayrollSettings,
        route: "/settingspayroll",
        icon: <ReceiptLongIcon />,
        isDefault: false,
      },
    ],
  },
  {
    id: Modules.Recruitment,
    title: ModulesTitles.Recruitment,
    constant: ModulesName.Recruitment,
    route: "/recruitment/",
    icon: <PersonSearch />,
    hasSubTabs: true,
    isDefault: false,
    subTabs: [
      {
        id: Modules.Jobs,
        constant: ModulesName.Jobs,
        title: ModulesTitles.Jobs,
        route: "/recruitment/jobs",
        icon: <Work />,
        isDefault: false,
      },
      {
        id: Modules.Applications,
        title: ModulesTitles.Applications,
        constant: ModulesName.Applications,
        route: "/recruitment/applications",
        icon: <Mail />,
        isDefault: false,
      },
      {
        id: Modules.ProcessLog,
        title: ModulesTitles.ProcessLog,
        constant: ModulesName.ProcessLog,
        route: "/recruitment/processlog",
        icon: <Book />,
        isDefault: false,
      },
      {
        id: Modules.CareerProfile,
        title: ModulesTitles.CareerProfile,
        constant: ModulesName.CareerProfile,
        route: "/recruitment/career-profile",
        icon: <WebRounded />,
        isDefault: false,
      },
    ],
  },
  {
    id: Modules.Admin,
    title: ModulesTitles.Admin,
    constant: ModulesName.Admin,
    route: "/admin/",
    icon: <Settings />,
    hasSubTabs: true,
    isDefault: false,
    adminOnly: true,
    subTabs: [
      {
        id: Modules.Permissions,
        title: ModulesTitles.Permissions,
        constant: ModulesName.Permissions,
        route: "/admin/roles",
        icon: <ToggleOn />,
        isDefault: false,
      },
      {
        id: Modules.CompanyMaster,
        title: ModulesTitles.CompanyMaster,
        constant: ModulesName.CompanyMaster,
        route: "/admin/companymaster/",
        icon: <AdminPanelSettings />,
        isDefault: false,
      },
      {
        id: Modules.CompanyDetails,
        title: ModulesTitles.CompanyDetails,
        constant: ModulesName.CompanyDetails,
        route: "/admin/companydetails",
        icon: <Info />,
        isDefault: false,
      },
      {
        id: Modules.Attendance,
        title: ModulesTitles.AttendanceSettings,
        constant: ModulesName.Attendance,
        route: "/attendance-settings",
        icon: <AccessTime />,
        isDefault: false,
      },
    ],
  },
  {
    id: Modules.Calendar,
    title: ModulesTitles.Calendar,
    constant: ModulesName.Calendar,
    route: "/calendar",
    icon: <CalendarMonth />,
    isDefault: false,
  },
  {
    id: Modules.NoticeBoard,
    constant: ModulesName.NoticeBoard,
    title: ModulesTitles.NoticeBoard,
    route: "/noticeboard",
    icon: <NoteAlt />,
    isDefault: false,
  },
  {
    id: Modules.Policies,
    constant: ModulesName.Policy,
    title: ModulesTitles.Policies,
    route: "/companypolicy/policies",
    icon: <PolicyIcon />,
    isDefault: false,
  },
];
