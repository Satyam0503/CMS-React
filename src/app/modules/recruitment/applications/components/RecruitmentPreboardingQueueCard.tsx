import { Alert, Avatar, Box, Card, Chip, Divider, Stack, Tooltip, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import { useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentPreboardingQueue } from "../../services";
import { RecruitmentPreboardingQueueItem } from "../../models";

export type CandidateDisplayInfo = {
  fullName: string;
  email?: string;
  vacancyName?: string;
};

type Props = {
  onApplicantSelect?: (applicantId: string) => void;
  applicantLookup?: Record<string, CandidateDisplayInfo>;
};

const getInitials = (name?: string) => {
  if (!name) return "PB";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "PB";
};

export default function RecruitmentPreboardingQueueCard({
  onApplicantSelect,
  applicantLookup,
}: Props) {
  const [items, setItems] = useState<RecruitmentPreboardingQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentPreboardingQueue();
      if (data.success) setItems(data.methodResult ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={1}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Preboarding Verification & Readiness
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mandatory pre-hire tasks (candidate details, documents, verification) before employee conversion.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label={`${items.length} active`} color="primary" variant="outlined" />
            <AppButton
              size="small"
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </AppButton>
          </Stack>
        </Stack>

        <Divider />

        {items.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1.25,
            }}
          >
            {items.slice(0, 8).map((item) => {
              const candidate = applicantLookup?.[item.applicantId];
              const displayName =
                item.applicantName || candidate?.fullName || `Candidate #${item.applicantId.slice(-6).toUpperCase()}`;
              const subtitle = (item.vacancyName || candidate?.vacancyName)
                ? `${item.vacancyName || candidate?.vacancyName} · ${item.firstBlockerCode || "All tasks clear"}`
                : `${item.ownerUserId || "HR Team"} · ${item.firstBlockerCode || "All tasks clear"}`;

              return (
                <Tooltip
                  key={item.caseId}
                  title={item.email || candidate?.email ? `${item.email || candidate?.email} (ID: ${item.applicantId})` : `Applicant ID: ${item.applicantId}`}
                  placement="top"
                  arrow
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    onClick={() => onApplicantSelect?.(item.applicantId)}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: item.readyForHire ? "success.light" : "divider",
                      cursor: onApplicantSelect ? "pointer" : "default",
                      transition: "all 150ms ease",
                      "&:hover": onApplicantSelect
                        ? {
                            borderColor: "primary.main",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                          }
                        : undefined,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        bgcolor: item.readyForHire
                          ? "rgba(46, 125, 50, 0.14)"
                          : "rgba(237, 108, 2, 0.14)",
                        color: item.readyForHire ? "success.main" : "warning.main",
                      }}
                    >
                      {getInitials(candidate?.fullName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {subtitle}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={
                        item.readyForHire
                          ? "Ready for Hire"
                          : `${item.pendingTaskCount} task${item.pendingTaskCount === 1 ? "" : "s"} pending`
                      }
                      color={item.readyForHire ? "success" : "warning"}
                      variant={item.readyForHire ? "filled" : "outlined"}
                    />
                    {onApplicantSelect && (
                      <ArrowOutwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />
                    )}
                  </Stack>
                </Tooltip>
              );
            })}
          </Box>
        ) : (
          <Alert severity="success">No active preboarding blockers in queue.</Alert>
        )}
      </Stack>
    </Card>
  );
}
