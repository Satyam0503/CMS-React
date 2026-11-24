import {
  ArrowForwardRounded,
  LocationOnRounded,
  WorkOutlineRounded,
  EventAvailableRounded,
  PaymentsRounded,
} from "@mui/icons-material";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PublicJobSummary } from "../../applynow/publicCareerTypes";
import { SaveJobButton } from "./SaveJobButton";
import { Btn } from "../../../shared/components/ui";
import { CompanyLogo } from "./CompanyLogo";

const decodeHtml = (str?: string | null): string => {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const cleanLocation = (loc?: string | null): string => {
  if (!loc) return "";
  return decodeHtml(loc).replace(/\s*,\s*/g, ", ").trim();
};

export const JobCard = ({ job, onSavedChange }: {
  job: PublicJobSummary;
  onSavedChange?: (saved: boolean) => void;
}) => {
  const navigate = useNavigate();
  const salary = (() => {
    if (!job.showSalary || job.salaryMin == null) return null;
    try {
      const format = new Intl.NumberFormat("en-IN", { style: "currency", currency: (job.currency || "INR").trim().toUpperCase(), maximumFractionDigits: 0 });
      return format.format(job.salaryMin) + (job.salaryMax != null && job.salaryMax !== job.salaryMin ? `–${format.format(job.salaryMax)}` : "");
    } catch {
      return `${job.salaryMin.toLocaleString("en-IN")}${job.salaryMax != null ? `–${job.salaryMax.toLocaleString("en-IN")}` : ""} ${job.currency || ""}`.trim();
    }
  })();
  const deadline = job.applicationDeadline ? new Date(job.applicationDeadline) : null;
  return (
    <Card
      component="article"
      sx={{
        p: { xs: 2, sm: 2.25, md: 2.5 },
        borderRadius: { xs: 3, sm: 4 },
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 8px 30px color-mix(in srgb, var(--mui-palette-common-black) 6%, transparent)",
        transition: "border-color .2s ease, box-shadow .2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 20px 50px color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
        },
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
        <Box sx={{ flexShrink: 0 }}><CompanyLogo src={job.companyLogo} name={job.companyName} size={48} /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Box>
              <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ mb: 0.6 }}>
                {job.isFeatured && <Chip size="small" color="primary" label="Featured" />}
                {job.isUrgentHiring && <Chip size="small" color="warning" label="Urgent hiring" />}
                {job.isWalkIn && <Chip size="small" color="success" label="Walk-in" />}
                {!job.canApply && <Chip size="small" color="default" variant="outlined" label="Applications paused" title={job.applicationClosedReason || "Applications are temporarily paused for this role."} />}
              </Stack>
              <Typography component={RouterLink} to={`/careers/${job.companyPublicCode}/jobs/${job.slug}`} variant="h6" fontWeight={850} letterSpacing="-.025em" sx={{ color: "text.primary", textDecoration: "none", fontSize: { sm: "1.35rem" }, lineHeight: 1.25, "&:hover": { color: "primary.main", textDecoration: "underline" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 3 } }}>{decodeHtml(job.title)}</Typography>
              <Typography color="text.secondary" fontWeight={650} sx={{ mt: 0.4 }}>{decodeHtml(job.companyName)}</Typography>
            </Box>
            <SaveJobButton publicJobId={job.publicJobId} onChange={onSavedChange} />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ mt: 1.25 }}>
            {job.location && <Chip size="small" icon={<LocationOnRounded />} label={cleanLocation(job.location)} />}
            {job.employmentType && <Chip size="small" icon={<WorkOutlineRounded />} label={job.employmentType} />}
            {job.workplaceType && <Chip size="small" label={job.workplaceType} />}
            {job.experienceMin != null && <Chip size="small" label={`${job.experienceMin}–${job.experienceMax ?? job.experienceMin}+ yrs`} />}
          </Stack>
          {(salary || job.applicationDeadline) && (
            <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.25 }}>
              {salary && <Stack direction="row" spacing={0.5} alignItems="center"><PaymentsRounded fontSize="small" color="primary" /><Typography variant="body2" fontWeight={750}>{salary}</Typography></Stack>}
              {deadline && !Number.isNaN(deadline.getTime()) && <Stack direction="row" spacing={0.5} alignItems="center"><EventAvailableRounded fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">Apply by {deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Typography></Stack>}
            </Stack>
          )}
          {(job.summary || job.shortDescription) && (
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.55, fontSize: { xs: "0.875rem", sm: "inherit" }, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {decodeHtml(job.summary || job.shortDescription)}
            </Typography>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={1} sx={{ mt: 1.5 }}>
            <Stack direction="row" gap={0.7} flexWrap="wrap" sx={{ minWidth: 0 }}>
              {job.skills?.slice(0, 4).map((skill) => <Chip key={skill} size="small" variant="outlined" label={skill} />)}
            </Stack>
            <Btn onClick={() => navigate(`/careers/${job.companyPublicCode}/jobs/${job.slug}`)} endIcon={<ArrowForwardRounded />} sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "auto" } }}>View role</Btn>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};
