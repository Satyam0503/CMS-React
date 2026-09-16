import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { getEmployeeLifecycleCases, EmployeeLifecycleCase } from "../employeeServices";

export const EmployeeLifecycleReconciliationPanel = ({ showHeader = true }: { showHeader?: boolean }) => {
  const [cases, setCases] = useState<EmployeeLifecycleCase[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getEmployeeLifecycleCases()
      .then((response) => {
        if (!active) return;
        // EmployeeLifecycleCaseController returns the case list directly.
        // Keep support for the older wrapped methodResults response while the
        // API contract is rolled out across environments.
        const payload = response.data as unknown;
        const result = Array.isArray(payload)
          ? payload
          : (payload as { methodResults?: EmployeeLifecycleCase[] })?.methodResults;
        setCases(Array.isArray(result) ? result : []);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const statuses = cases.reduce<Record<string, number>>((result, item) => {
    const key = item.leaveReconciliationStatus || "Not available";
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});
  const totalDays = cases.reduce((sum, item) => sum + (item.leaveTotalDays || 0), 0);

  return (
    <Card sx={{ mb: showHeader ? 2 : 0, border: showHeader ? "1px solid" : 0, borderColor: "rgba(41, 142, 137, .18)", borderRadius: showHeader ? 3 : 0, boxShadow: showHeader ? "0 10px 28px rgba(33, 93, 110, .06)" : "none", backgroundColor: showHeader ? "background.paper" : "transparent" }}>
      <CardContent sx={{ p: showHeader ? { xs: 2, sm: 2.5 } : 0 }}>
        <Stack spacing={1.25}>
          {showHeader && <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box sx={{ width: 38, height: 38, borderRadius: 2, display: "grid", placeItems: "center", color: "success.main", bgcolor: "rgba(46, 125, 50, .1)", flexShrink: 0 }}><FactCheckOutlined fontSize="small" /></Box><Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-.02em" }}>Leave-to-employment reconciliation</Typography>
            <Typography variant="body2" color="text.secondary">
              Read-only evidence from approved lifecycle-linked leave. Leave balances and attendance remain owned by their respective modules.
            </Typography>
            </Box>
          </Stack>}
          {loading && <Stack alignItems="center" spacing={1} sx={{ py: 3 }}><CircularProgress size={26} /><Typography variant="body2" color="text.secondary">Loading reconciliation snapshot…</Typography></Stack>}
          {error && !loading && <Alert severity="warning">Reconciliation snapshot could not be loaded. Try again later.</Alert>}
          {!error && !loading && <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.25 }}>
              <Box sx={{ p: 1.5, border: "1px solid", borderColor: "primary.light", borderRadius: 2, bgcolor: "rgba(255,255,255,.78)" }}><Typography variant="h5" sx={{ fontWeight: 850, color: "primary.main" }}>{cases.length} <Box component="span" sx={{ fontSize: "0.78rem", fontWeight: 750 }}>linked cases</Box></Typography></Box>
              <Box sx={{ p: 1.5, border: "1px solid", borderColor: "primary.light", borderRadius: 2, bgcolor: "rgba(255,255,255,.78)" }}><Typography variant="h5" sx={{ fontWeight: 850, color: "primary.main" }}>{totalDays} <Box component="span" sx={{ fontSize: "0.78rem", fontWeight: 750 }}>leave days</Box></Typography></Box>
            </Box>
            {cases.length === 0 ? <Alert severity="success" sx={{ mt: .25 }}>No approved lifecycle-linked leave has been recorded.</Alert> : <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75 }}>{Object.entries(statuses).map(([status, count]) => <Chip key={status} label={`${status}: ${count}`} size="small" />)}</Box>}
          </>}
        </Stack>
      </CardContent>
    </Card>
  );
};
