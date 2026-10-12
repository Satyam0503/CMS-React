import { Alert, Avatar, Box, Card, Chip, Divider, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentPendingOffers, getRecruitmentSelectedCandidates } from "../../services";
import {
  RecruitmentOfferPendingQueueItem,
  RecruitmentSelectedCandidateQueueItem,
} from "../../models";

type Props = {
  vacancyId?: string | null;
  onApplicantSelect?: (applicantId: string) => void;
};

const getInitials = (name?: string) => {
  if (!name) return "CA";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "CA";
};

export default function RecruitmentSelectedOfferQueueCard({
  vacancyId,
  onApplicantSelect,
}: Props) {
  const [selected, setSelected] = useState<RecruitmentSelectedCandidateQueueItem[]>([]);
  const [offers, setOffers] = useState<RecruitmentOfferPendingQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [selectedResponse, offerResponse] = await Promise.all([
        getRecruitmentSelectedCandidates(vacancyId ?? undefined),
        getRecruitmentPendingOffers(vacancyId ?? undefined),
      ]);
      if (selectedResponse.data.success) {
        setSelected(selectedResponse.data.methodResult ?? []);
      }
      if (offerResponse.data.success) {
        setOffers(offerResponse.data.methodResult ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    void load();
  }, [load]);

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
              Selected Candidates & Offer Queue
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Selected candidates remain separate from employees until preboarding handoff & conversion.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label={`${selected.length} selected`} color="success" variant="outlined" />
            <Chip size="small" label={`${offers.length} pending offers`} color="primary" variant="outlined" />
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          {/* Left Column: Selected Candidates */}
          <Stack
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={800}>
                Selected Candidates
              </Typography>
              <Chip size="small" label={selected.length} color="success" />
            </Stack>
            {selected.length ? (
              <Stack spacing={0.85}>
                {selected.slice(0, 6).map((item) => (
                  <Stack
                    key={item.applicantId}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    onClick={() => onApplicantSelect?.(item.applicantId)}
                    sx={{
                      p: 1,
                      borderRadius: 1.75,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: onApplicantSelect ? "pointer" : "default",
                      transition: "all 150ms ease",
                      "&:hover": onApplicantSelect
                        ? {
                            borderColor: "primary.main",
                            boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                          }
                        : undefined,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        bgcolor: "rgba(46, 125, 50, 0.14)",
                        color: "success.main",
                      }}
                    >
                      {getInitials(item.applicantName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {item.applicantName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {item.email || "No email provided"}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={item.isEmployee ? "Converted Employee" : "Ready for Offer"}
                      color={item.isEmployee ? "success" : "primary"}
                      variant={item.isEmployee ? "filled" : "outlined"}
                    />
                    {onApplicantSelect && (
                      <ArrowOutwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />
                    )}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">No selected candidates in queue.</Alert>
            )}
          </Stack>

          {/* Right Column: Offers Requiring Action */}
          <Stack
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={800}>
                Offers Requiring Action
              </Typography>
              <Chip size="small" label={offers.length} color="warning" />
            </Stack>
            {offers.length ? (
              <Stack spacing={0.85}>
                {offers.slice(0, 6).map((item) => (
                  <Stack
                    key={item.offerId}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    onClick={() => onApplicantSelect?.(item.applicantId)}
                    sx={{
                      p: 1,
                      borderRadius: 1.75,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: onApplicantSelect ? "pointer" : "default",
                      transition: "all 150ms ease",
                      "&:hover": onApplicantSelect
                        ? {
                            borderColor: "primary.main",
                            boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                          }
                        : undefined,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        bgcolor: "rgba(237, 108, 2, 0.14)",
                        color: "warning.main",
                      }}
                    >
                      {getInitials(item.applicantName || item.applicantId)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {item.applicantName || `Candidate #${item.applicantId.slice(-6)}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {item.currency} {item.salary.toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={item.approvalRequired ? "Needs Approval" : item.status}
                      color={item.approvalRequired ? "warning" : "primary"}
                      variant="outlined"
                    />
                    {onApplicantSelect && (
                      <ArrowOutwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />
                    )}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Alert severity="success">No pending offers requiring action.</Alert>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
