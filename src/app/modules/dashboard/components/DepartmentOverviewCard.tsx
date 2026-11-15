import { MoreHoriz } from "@mui/icons-material";
import { Box, LinearProgress, Skeleton, Stack, Typography, alpha, useColorScheme } from "@mui/material";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { getChartPalette } from "../../theme/themePalettes";
import { useCompanyTheme } from "../../theme/companyTheme";
import { useDepartmentsQuery } from "../dashboardQueries";
import { departmentRows } from "../dashboardMetrics";
import { CardMessage, DashboardCard, LoadError } from "./DashboardCard";

const headSx = { fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary", textAlign: "left", pb: 1, borderBottom: 1, borderColor: "divider" } as const;
const cellSx = { py: 0.9, borderBottom: 1, borderColor: "divider", fontSize: "0.9375rem", verticalAlign: "middle" } as const;

export const DepartmentOverviewCard = () => {
  const { formatMessage: i } = useIntl();
  const { data, isPending, isError } = useDepartmentsQuery();
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector((state) => state.user.userData?.defaultLanguage ?? "");
  const { mode, systemMode } = useColorScheme();
  const { theme: appStyle } = useCompanyTheme();
  const palette = getChartPalette(mode, systemMode, appStyle);

  const rows = useMemo(
    () =>
      departmentRows(
        data?.success ? data.methodResults ?? [] : [],
        (dep) => dep.label?.[currentLanguage] || dep.label?.[defaultLanguage] || i({ id: "TRANSLATION_MISSING" }),
        i({ id: "DASHBOARD.DEPARTMENTS.OTHERS" }),
      ),
    [data, currentLanguage, defaultLanguage, i],
  );

  const body = () => {
    if (isPending) return <Stack spacing={1.5}>{Array.from({ length: 6 }).map((_, k) => <Skeleton key={k} variant="rounded" height={28} />)}</Stack>;
    if (isError || (data && !data.success)) return <LoadError />;
    if (rows.length === 0) return <CardMessage>{i({ id: "DASHBOARD.DEPARTMENTS.EMPTY" })}</CardMessage>;

    return (
      <Box sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Box component="th" scope="col" sx={headSx}>{i({ id: "DASHBOARD.DEPARTMENTS.DEPARTMENT" })}</Box>
              <Box component="th" scope="col" sx={{ ...headSx, textAlign: "right", pr: 2 }}>{i({ id: "DASHBOARD.DEPARTMENTS.EMPLOYEES" })}</Box>
              <Box component="th" scope="col" sx={{ ...headSx, textAlign: "right" }} colSpan={2}>{i({ id: "DASHBOARD.DEPARTMENTS.SHARE" })}</Box>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const color = palette[index % palette.length];
              return (
                <tr key={row.id}>
                  <Box component="td" sx={cellSx}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        aria-hidden
                        sx={{ width: 28, height: 28, borderRadius: "8px", flexShrink: 0, display: "grid", placeItems: "center", fontSize: "0.75rem", fontWeight: 700, color, bgcolor: alpha(color, 0.14) }}
                      >
                        {row.isOthers ? <MoreHoriz sx={{ fontSize: 16 }} /> : row.name.charAt(0).toUpperCase()}
                      </Box>
                      <Typography noWrap sx={{ fontSize: "inherit", fontWeight: 500, maxWidth: { xs: 120, sm: 200 } }} title={row.name}>
                        {row.name}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box component="td" sx={{ ...cellSx, textAlign: "right", pr: 2, fontVariantNumeric: "tabular-nums" }}>{row.count}</Box>
                  <Box component="td" sx={{ ...cellSx, width: "38%", display: "none", "@container (min-width: 420px)": { display: "table-cell" } }}>
                    <LinearProgress
                      variant="determinate"
                      value={row.percent}
                      aria-hidden
                      sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "primary.main" } }}
                    />
                  </Box>
                  <Box component="td" sx={{ ...cellSx, textAlign: "right", pl: 1.5, color: "text.secondary", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {Math.round(row.percent)}%
                  </Box>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Box>
    );
  };

  return (
    <DashboardCard id="department-overview" title={i({ id: "DASHBOARD.DEPARTMENTS.TITLE" })}>
      {body()}
    </DashboardCard>
  );
};
