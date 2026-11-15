import { EventNoteOutlined, PaymentsOutlined, PersonAddAlt1Outlined, WorkOutlineOutlined } from "@mui/icons-material";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { DashboardCard, IconTile, TileColor } from "./DashboardCard";

export type QuickActionAccess = { addEmployee: boolean; applyLeave: boolean; runPayroll: boolean; postJob: boolean };

const ACTIONS: { key: keyof QuickActionAccess; label: string; to: string; icon: ReactNode; color: TileColor }[] = [
  { key: "addEmployee", label: "DASHBOARD.QUICK.ADD_EMPLOYEE", to: "/employees", icon: <PersonAddAlt1Outlined />, color: "primary" },
  { key: "applyLeave", label: "DASHBOARD.QUICK.APPLY_LEAVE", to: "/leavemanagement", icon: <EventNoteOutlined />, color: "info" },
  { key: "runPayroll", label: "DASHBOARD.QUICK.RUN_PAYROLL", to: "/payroll", icon: <PaymentsOutlined />, color: "warning" },
  { key: "postJob", label: "DASHBOARD.QUICK.POST_JOB", to: "/recruitment/jobs", icon: <WorkOutlineOutlined />, color: "secondary" },
];

export const QuickActionsCard = ({ access }: { access: QuickActionAccess }) => {
  const { formatMessage: i } = useIntl();
  const actions = ACTIONS.filter((action) => access[action.key]);
  if (actions.length === 0) return null;

  return (
    <DashboardCard id="quick-actions" title={i({ id: "DASHBOARD.QUICK.TITLE" })}>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))`, gap: 0.5 }}>
        {actions.map((action) => (
          <ButtonBase
            key={action.key}
            component={Link}
            to={action.to}
            sx={{ flexDirection: "column", gap: 1, py: 1, px: 0.5, borderRadius: "12px", "&:hover": { bgcolor: "action.hover" } }}
          >
            <IconTile color={action.color} size={48}>
              {action.icon}
            </IconTile>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, textAlign: "center", lineHeight: 1.25, overflowWrap: "anywhere", color: "text.primary" }}>
              {i({ id: action.label })}
            </Typography>
          </ButtonBase>
        ))}
      </Box>
    </DashboardCard>
  );
};
