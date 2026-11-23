import { Alert, Box, Card, Chip, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import FolderSharedOutlined from "@mui/icons-material/FolderSharedOutlined";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import LabelOutlined from "@mui/icons-material/LabelOutlined";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentTalentPoolMembers } from "../../services";
import { RecruitmentTalentPoolMember } from "../../models";

type Props = {
  applicantLookup?: Record<string, { fullName: string; email?: string; vacancyName?: string }>;
  onApplicantSelect?: (applicantId: string) => void;
};

const COMMON_POOLS = ["All", "Silver Medalists", "Future Leads", "Campus", "Executive", "Engineering Leads"];

export default function RecruitmentTalentPoolCard({ applicantLookup, onApplicantSelect }: Props) {
  const [members, setMembers] = useState<RecruitmentTalentPoolMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [poolFilter, setPoolFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Archived">("Active");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { data } = await getRecruitmentTalentPoolMembers({
        poolName: poolFilter === "All" ? undefined : poolFilter,
        status: statusFilter === "All" ? undefined : statusFilter,
      });
      if (data?.success && data?.methodResult) {
        setMembers(data.methodResult);
      } else {
        setMembers([]);
      }
    } catch (err) {
      setError((err as Error).message || "Failed to load talent pool members.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [poolFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const query = search.trim().toLowerCase();
    return members.filter((m) => {
      const name = applicantLookup?.[m.applicantId]?.fullName?.toLowerCase() ?? "";
      const email = applicantLookup?.[m.applicantId]?.email?.toLowerCase() ?? "";
      const pool = m.poolName?.toLowerCase() ?? "";
      const tagsMatch = m.tags?.some((t) => t.toLowerCase().includes(query)) ?? false;
      const notesMatch = m.notes?.toLowerCase().includes(query) ?? false;
      return name.includes(query) || email.includes(query) || pool.includes(query) || tagsMatch || notesMatch || m.applicantId.toLowerCase().includes(query);
    });
  }, [members, search, applicantLookup]);

  const activeCount = useMemo(() => members.filter((m) => m.status === "Active").length, [members]);
  const archivedCount = useMemo(() => members.filter((m) => m.status === "Archived").length, [members]);

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2.25 },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,250,252,0.98) 100%)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
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
            <Stack direction="row" spacing={1} alignItems="center">
              <FolderSharedOutlined color="primary" sx={{ fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={800}>
                Talent Pool & Rediscovery
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Search, filter, and rediscover qualified candidates across silver medalists and future talent pipelines.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
            <Chip size="small" label={`${members.length} Total`} color="primary" variant="outlined" />
            <Chip size="small" label={`${activeCount} Active`} color="success" />
            {archivedCount > 0 && <Chip size="small" label={`${archivedCount} Archived`} color="default" />}
            <AppButton
              size="small"
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </AppButton>
          </Stack>
        </Stack>

        <Divider />

        {/* Filter Bar */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
          <TextField
            size="small"
            placeholder="Search by name, tags, pool, or notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1.5 }}
          />
          <TextField
            select
            size="small"
            label="Pool Category"
            value={poolFilter}
            onChange={(e) => setPoolFilter(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          >
            {COMMON_POOLS.map((pool) => (
              <MenuItem key={pool} value={pool}>
                {pool === "All" ? "All Pools" : pool}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </TextField>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Divider />

        {/* Candidate List */}
        {filteredMembers.length > 0 ? (
          <Stack spacing={1}>
            {filteredMembers.map((member) => {
              const lookup = applicantLookup?.[member.applicantId];
              const candidateName = lookup?.fullName || `Candidate (${member.applicantId.slice(0, 8)})`;
              const candidateEmail = lookup?.email;
              const vacancy = lookup?.vacancyName;

              return (
                <Stack
                  key={member.memberId || member.applicantId}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 150ms ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "background.paper",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          cursor: onApplicantSelect ? "pointer" : "default",
                          "&:hover": onApplicantSelect ? { textDecoration: "underline", color: "primary.main" } : {},
                        }}
                        onClick={() => onApplicantSelect?.(member.applicantId)}
                      >
                        {candidateName}
                      </Typography>
                      <Chip
                        size="small"
                        label={member.poolName}
                        color="primary"
                        sx={{ fontWeight: 600, height: 20, fontSize: "0.72rem" }}
                      />
                      <Chip
                        size="small"
                        label={member.status}
                        color={member.status === "Active" ? "success" : "default"}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.72rem" }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} useFlexGap flexWrap="wrap">
                      {candidateEmail && (
                        <Typography variant="caption" color="text.secondary">
                          {candidateEmail}
                        </Typography>
                      )}
                      {vacancy && (
                        <Typography variant="caption" color="text.secondary">
                          • {vacancy}
                        </Typography>
                      )}
                      {member.tags && member.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LabelOutlined sx={{ fontSize: 13, color: "text.secondary" }} />
                          {member.tags.slice(0, 4).map((tag) => (
                            <Chip
                              key={tag}
                              size="small"
                              label={tag}
                              variant="outlined"
                              sx={{ height: 18, fontSize: "0.68rem" }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Stack>

                    {member.notes && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontStyle: "italic",
                        }}
                      >
                        Notes: {member.notes}
                      </Typography>
                    )}
                  </Box>

                  <AppButton
                    size="small"
                    variant="outlined"
                    endIcon={<OpenInNewRounded sx={{ fontSize: 16 }} />}
                    onClick={() => onApplicantSelect?.(member.applicantId)}
                    sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    View
                  </AppButton>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {members.length === 0
              ? "No candidate records found in the talent pool for the selected criteria."
              : "No candidates match the current search filter."}
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
