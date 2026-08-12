import {
  AccessTimeRounded,
  ArrowBackRounded,
  ArrowOutwardRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CheckCircleOutlineRounded,
  LocationOnRounded,
  PaymentsRounded,
  SchoolRounded,
  WorkOutlineRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicJobApplyModal } from "../../applynow/PublicJobApplyModal";
import { getPublicJobBySlug } from "../../applynow/publicCareerService";
import { PublicJobDetails } from "../../applynow/publicCareerTypes";
import { CareerHeader } from "../components/CareerHeader";
import { JobCard } from "../components/JobCard";
import { SaveJobButton } from "../components/SaveJobButton";
import { getCareerSession, getCareerVisitorToken } from "../hooks/useCareerVisitor";
import {
  discoverJobs,
  followCompany,
  trackCareerEvent,
} from "../services/careerPortalService";
import { PublicJobSummary } from "../../applynow/publicCareerTypes";
import { Alrt, Btn } from "../../../shared/components/ui";
import { CircularLoader } from "../../../shared/components";
import { CompanyLogo } from "../components/CompanyLogo";

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) =>
  value ? <Stack direction="row" spacing={1.2} alignItems="flex-start"><Box sx={{ color: "primary.main", mt: 0.15 }}>{icon}</Box><Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={700}>{value}</Typography></Box></Stack> : null;

const ListSection = ({ title, values }: { title: string; values?: string[] }) =>
  values?.length ? (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight={900}>{title}</Typography>
      <Stack spacing={1.2} sx={{ mt: 2 }}>
        {values.map((value) => <Stack key={value} direction="row" spacing={1.2} alignItems="flex-start"><CheckCircleOutlineRounded color="primary" sx={{ fontSize: 20, mt: 0.25 }} /><Typography color="text.secondary" lineHeight={1.7}>{value}</Typography></Stack>)}
      </Stack>
    </Box>
  ) : null;

export const CareerJobDetails = () => {
  const { companyCode, jobSlug } = useParams();
  const [job, setJob] = useState<PublicJobDetails | null>(null);
  const [similar, setSimilar] = useState<PublicJobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const description = useMemo(() => ({ __html: DOMPurify.sanitize(job?.description || "") }), [job]);

  useEffect(() => { if (job) document.title = `${job.title} - ${job.companyName}`; }, [job]);

  useEffect(() => {
    if (!companyCode || !jobSlug || !/^\d{6}$/.test(companyCode)) {
      setError("This job link is invalid.");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getPublicJobBySlug(jobSlug)
      .then(({ data }) => {
        const value = data.methodResult;
        if (!data.success || !value || value.companyPublicCode !== companyCode) throw new Error("Job not found.");
        if (!active) return;
        setJob(value);
        try {
          const recent = JSON.parse(localStorage.getItem("career_recent_jobs") || "[]") as PublicJobSummary[];
          localStorage.setItem(
            "career_recent_jobs",
            JSON.stringify([value, ...recent.filter((x) => x.publicJobId !== value.publicJobId)].slice(0, 6)),
          );
        } catch {
          localStorage.removeItem("career_recent_jobs");
        }
        trackCareerEvent("JobViewed", getCareerVisitorToken(), value.publicJobId, companyCode);
        discoverJobs(undefined, {
          industry: value.industry || undefined,
          department: value.department || undefined,
          skills: value.skills?.slice(0, 4).join(",") || undefined,
          workplaceType: value.workplaceType || undefined,
          experienceMin: value.experienceMin ?? undefined,
          experienceMax: value.experienceMax ?? undefined,
          pageSize: 6,
          sort: "newest",
        })
          .then(({ data: related }) => setSimilar((related.methodResults ?? []).filter((x) => x.publicJobId !== value.publicJobId).slice(0, 3)))
          .catch(() => setSimilar([]));
      })
      .catch((reason) => active && setError(reason?.response?.data?.message || reason.message || "Job not found."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [companyCode, jobSlug]);

  const follow = async () => {
    const session = getCareerSession();
    if (!session) {
      setNotice("Verify an email on the Job alerts page before following companies.");
      return;
    }
    await followCompany(companyCode!, session);
    setNotice(`You’re now following ${job?.companyName}.`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <CareerHeader />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Btn component={Link} to={companyCode ? `/careers/${companyCode}` : "/careers"} color="inherit" startIcon={<ArrowBackRounded />}>Back to jobs</Btn>
        {loading ? <Box sx={{ minHeight: 500 }}><CircularLoader /></Box> :
        error || !job ? <Alrt severity="error" sx={{ mt: 3 }}>{error || "Job not found."}</Alrt> : (
          <>
            <Stack direction={{ xs: "column", lg: "row" }} gap={3.5} alignItems="flex-start" sx={{ mt: 2 }}>
              <Paper sx={{ flex: 1, minWidth: 0, width: "100%", borderRadius: 5, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <Box
                  sx={{
                    p: { xs: 3, md: 5 },
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 10%, var(--mui-palette-background-paper)), var(--mui-palette-background-paper))",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Stack
                      component={Link}
                      to={`/careers/${job.companyPublicCode}`}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      aria-label={`View ${job.companyName} company profile`}
                      sx={{ minWidth: 0, color: "inherit", textDecoration: "none", borderRadius: 2, "&:hover": { color: "primary.main" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 4 } }}
                    >
                      <CompanyLogo src={job.companyLogo} name={job.companyName} size={60} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>{job.companyName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                          View company profile
                        </Typography>
                      </Box>
                    </Stack>
                    <Btn
                      onClick={follow}
                      size="small"
                      variant="contained"
                      sx={{
                        flexShrink: 0,
                        px: 2,
                        py: 1,
                        borderRadius: 999,
                        fontWeight: 800,
                        textTransform: "none",
                        color: "common.white",
                        background: "linear-gradient(135deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
                        boxShadow: "0 10px 24px color-mix(in srgb, var(--mui-palette-primary-main) 28%, transparent)",
                        "&:hover": {
                          background: "linear-gradient(135deg, var(--mui-palette-primary-dark), var(--mui-palette-secondary-dark))",
                          boxShadow: "0 14px 28px color-mix(in srgb, var(--mui-palette-primary-main) 34%, transparent)",
                        },
                      }}
                    >
                      Follow company
                    </Btn>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mt: 4 }}>
                    <Box>
                      <Stack direction="row" gap={1} flexWrap="wrap">{job.isFeatured && <Chip color="primary" label="Featured" />}{job.isUrgentHiring && <Chip color="warning" label="Urgent hiring" />}</Stack>
                      <Typography variant="h1" sx={{ mt: 1.5, fontSize: { xs: "2.4rem", md: "4rem" }, lineHeight: 1.03, letterSpacing: "-.05em", fontWeight: 950 }}>{job.title}</Typography>
                      {job.summary && <Typography color="text.secondary" sx={{ mt: 2, fontSize: "1.08rem", lineHeight: 1.75, maxWidth: 780 }}>{job.summary}</Typography>}
                    </Box>
                    <SaveJobButton publicJobId={job.publicJobId} />
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
                    {job.location && <Chip icon={<LocationOnRounded />} label={job.location} />}
                    {job.workplaceType && <Chip icon={<WorkOutlineRounded />} label={job.workplaceType} />}
                    {job.employmentType && <Chip label={job.employmentType} />}
                    {job.department && <Chip label={job.department} />}
                  </Stack>
                </Box>
                <Box sx={{ p: { xs: 3, md: 5 }, pt: { xs: 1, md: 2 } }}>
                  <Stack direction={{ xs: "column", sm: "row" }} flexWrap="wrap" gap={3} sx={{ py: 3 }}>
                    <DetailRow icon={<WorkOutlineRounded />} label="Experience" value={job.experienceMin != null ? `${job.experienceMin}–${job.experienceMax ?? job.experienceMin}+ years` : undefined} />
                    <DetailRow icon={<PaymentsRounded />} label="Compensation" value={job.showSalary !== false && job.salaryMin != null ? `${job.currency || ""} ${job.salaryMin.toLocaleString()}–${job.salaryMax?.toLocaleString() || ""}` : undefined} />
                    <DetailRow icon={<SchoolRounded />} label="Education" value={job.educationRequirement} />
                    <DetailRow icon={<CalendarMonthRounded />} label="Apply before" value={job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : undefined} />
                    <DetailRow icon={<AccessTimeRounded />} label="Shift" value={job.shiftType} />
                  </Stack>
                  <Divider />
                  <Typography variant="h5" fontWeight={900} sx={{ mt: 4 }}>About the role</Typography>
                  <Box dangerouslySetInnerHTML={description} sx={{ color: "text.secondary", lineHeight: 1.8, mt: 2, "& h1,& h2,& h3": { color: "text.primary", mt: 3 }, "& ul,& ol": { pl: 3 }, "& p": { mb: 2 } }} />
                  <ListSection title="What you’ll do" values={job.responsibilities} />
                  <ListSection title="What we’re looking for" values={job.requiredSkills} />
                  <ListSection title="Nice to have" values={job.preferredSkills} />
                  <ListSection title="Benefits" values={job.benefits} />
                  {!!job.skills?.length && <Box sx={{ mt: 4 }}><Typography variant="h5" fontWeight={900}>Skills</Typography><Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>{job.skills.map((skill) => <Chip key={skill} label={skill} variant="outlined" color="primary" />)}</Stack></Box>}
                </Box>
              </Paper>
              <Paper sx={{ width: { xs: "100%", lg: 350 }, p: 3.5, borderRadius: 4, border: "1px solid", borderColor: "divider", position: { lg: "sticky" }, top: { lg: 94 }, boxShadow: "0 16px 45px color-mix(in srgb, var(--mui-palette-common-black) 8%, transparent)" }}>
                <BusinessRounded color="primary" />
                <Typography variant="h5" fontWeight={900} sx={{ mt: 1.5 }}>Ready for your next move?</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.65 }}>Your application goes directly to the hiring team for this role.</Typography>
                {job.applicationClosedReason && <Alert severity="warning" sx={{ mb: 2 }}>{job.applicationClosedReason}</Alert>}
                {job.applicationMode === "External" && job.externalApplicationUrl
                  ? <Btn fullWidth href={job.externalApplicationUrl} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<ArrowOutwardRounded />} disabled={!job.canApply} onClick={() => trackCareerEvent("ExternalApplyClicked", getCareerVisitorToken(), job.publicJobId, companyCode)}>Apply on company site</Btn>
                  : <Btn fullWidth variant="contained" size="large" onClick={() => { trackCareerEvent("ApplyClicked", getCareerVisitorToken(), job.publicJobId, companyCode); setApplyOpen(true); }} disabled={!job.canApply} sx={{ py: 1.4 }}>Apply now</Btn>}
                <Btn fullWidth component={Link} to={`/careers/${companyCode}`} sx={{ mt: 1.2 }}>More at {job.companyName}</Btn>
              </Paper>
            </Stack>
            {!!similar.length && <Box sx={{ mt: 7 }}><Typography variant="h4" fontWeight={900}>Similar opportunities</Typography><Stack spacing={2} sx={{ mt: 2.5 }}>{similar.map((item) => <JobCard key={item.publicJobId} job={item} />)}</Stack></Box>}
          </>
        )}
      </Container>
      <PublicJobApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} onSubmitted={setNotice} />
      <Snackbar open={Boolean(notice)} autoHideDuration={7000} onClose={() => setNotice("")}><Alert severity="info" variant="filled" onClose={() => setNotice("")}>{notice}</Alert></Snackbar>
    </Box>
  );
};
