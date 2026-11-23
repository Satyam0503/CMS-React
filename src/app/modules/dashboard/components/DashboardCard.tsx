import { Box, Card, Skeleton, Stack, Typography, alpha } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Link, useInRouterContext } from "react-router-dom";

export type TileColor = "primary" | "secondary" | "success" | "warning" | "error" | "info";

type DashboardCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  /** aria-labelledby target; defaults to a slug of the title */
  id?: string;
};

export const DashboardCard = ({ title, action, children, id }: DashboardCardProps) => {
  const headingId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;
  return (
    <Card
      component="section"
      aria-labelledby={headingId}
      sx={{ p: { xs: 2, md: 2.5 }, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ minHeight: 32 }}>
        <Typography id={headingId} component="h2" sx={{ fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
          {title}
        </Typography>
        {action}
      </Stack>
      <Box sx={{ flexGrow: 1, minWidth: 0, containerType: "inline-size" }}>{children}</Box>
    </Card>
  );
};

export const IconTile = ({ color, children, size = 44 }: { color: TileColor; children: ReactNode; size?: number }) => (
  <Box
    aria-hidden
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: size >= 44 ? "14px" : "50%",
      display: "grid",
      placeItems: "center",
      color: `${color}.main`,
      bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
      "& .MuiSvgIcon-root": { fontSize: size * 0.5 },
    }}
  >
    {children}
  </Box>
);

export const ViewAllLink = ({ to }: { to: string }) => {
  const { formatMessage: i } = useIntl();
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return (
      <Typography
        component="a"
        href={to}
        sx={{ fontSize: "0.875rem", fontWeight: 600, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
      >
        {i({ id: "DASHBOARD.VIEW_ALL" })}
      </Typography>
    );
  }
  return (
    <Typography
      component={Link}
      to={to}
      sx={{ fontSize: "0.875rem", fontWeight: 600, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
    >
      {i({ id: "DASHBOARD.VIEW_ALL" })}
    </Typography>
  );
};

export const CardMessage = ({ children }: { children: ReactNode }) => (
  <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", minHeight: 120, textAlign: "center", px: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  </Stack>
);

export const LoadError = () => {
  const { formatMessage: i } = useIntl();
  return <CardMessage><span role="alert">{i({ id: "DASHBOARD.LOAD_ERROR" })}</span></CardMessage>;
};

export const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <Stack spacing={2} aria-busy="true">
    {Array.from({ length: rows }).map((_, index) => (
      <Stack key={index} direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="35%" />
        </Box>
      </Stack>
    ))}
  </Stack>
);
