import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import BeachAccessOutlined from "@mui/icons-material/BeachAccessOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import { Box, ButtonBase, Stack, Typography, alpha } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Link, useInRouterContext } from "react-router-dom";
import { DashboardCard, IconTile, TileColor } from "./DashboardCard";

type Shortcut = {
  id: string;
  labelId: string;
  defaultLabel: string;
  descId: string;
  defaultDesc: string;
  to: string;
  color: TileColor;
  icon: ReactNode;
};

const SHORTCUTS: Shortcut[] = [
  {
    id: "attendance",
    labelId: "MODULES.ATTENDANCE",
    defaultLabel: "Attendance",
    descId: "DASHBOARD.SHORTCUTS.ATTENDANCE_DESC",
    defaultDesc: "View daily check-ins and monthly timesheets",
    to: "/attendance",
    color: "primary",
    icon: <AccessTimeOutlined />,
  },
  {
    id: "leave",
    labelId: "MODULES.LEAVE_MANAGEMENT",
    defaultLabel: "Leave Management",
    descId: "DASHBOARD.SHORTCUTS.LEAVE_DESC",
    defaultDesc: "Check balances and request time off",
    to: "/leavemanagement",
    color: "info",
    icon: <BeachAccessOutlined />,
  },
  {
    id: "calendar",
    labelId: "MODULES.CALENDAR",
    defaultLabel: "Calendar & Holidays",
    descId: "DASHBOARD.SHORTCUTS.CALENDAR_DESC",
    defaultDesc: "Explore upcoming holidays and company events",
    to: "/calendar",
    color: "warning",
    icon: <CalendarMonthOutlined />,
  },
  {
    id: "profile",
    labelId: "MODULES.MY_PROFILE",
    defaultLabel: "My Profile",
    descId: "DASHBOARD.SHORTCUTS.PROFILE_DESC",
    defaultDesc: "Manage personal details and documents",
    to: "/profile",
    color: "success",
    icon: <PersonOutlineOutlined />,
  },
];

export const EmployeeShortcutsCard = () => {
  const { formatMessage: i } = useIntl();
  const inRouter = useInRouterContext();

  return (
    <DashboardCard
      id="employee-shortcuts"
      title={i({ id: "DASHBOARD.SHORTCUTS.TITLE", defaultMessage: "Quick Services & Navigation" })}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {SHORTCUTS.map((item) => {
          const content = (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                textDecoration: "none",
                color: "text.primary",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[item.color].main, 0.15)}`,
                  borderColor: `${item.color}.main`,
                  "& .arrow-icon": {
                    transform: "translateX(4px)",
                    color: `${item.color}.main`,
                  },
                },
              }}
            >
              <IconTile color={item.color} size={48}>
                {item.icon}
              </IconTile>
              <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.3 }}>
                  {i({ id: item.labelId, defaultMessage: item.defaultLabel })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", mt: 0.25 }} noWrap>
                  {i({ id: item.descId, defaultMessage: item.defaultDesc })}
                </Typography>
              </Box>
              <ArrowForwardOutlined
                className="arrow-icon"
                sx={{
                  fontSize: 18,
                  color: "text.disabled",
                  transition: "transform 0.2s ease, color 0.2s ease",
                  flexShrink: 0,
                }}
              />
            </Stack>
          );

          if (inRouter) {
            return (
              <ButtonBase
                key={item.id}
                component={Link}
                to={item.to}
                sx={{ display: "block", textAlign: "left", borderRadius: "12px", width: "100%" }}
              >
                {content}
              </ButtonBase>
            );
          }

          return (
            <ButtonBase
              key={item.id}
              component="a"
              href={item.to}
              sx={{ display: "block", textAlign: "left", borderRadius: "12px", width: "100%" }}
            >
              {content}
            </ButtonBase>
          );
        })}
      </Box>
    </DashboardCard>
  );
};

