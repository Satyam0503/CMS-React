import { Alert, Avatar, Box, Button, Chip, CircularProgress, Container, Divider, Paper, Snackbar, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicJobBySlug } from "./publicCareerService";
import { PublicJobDetails as Job } from "./publicCareerTypes";
import { PublicJobApplyModal } from "./PublicJobApplyModal";

export const PublicJobDetails = () => {
  const { companyCode, jobSlug } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const description = useMemo(() => ({ __html: DOMPurify.sanitize(job?.description || "") }), [job]);

  useEffect(() => {
    if (!jobSlug || !companyCode || !/^\d{6}$/.test(companyCode)) {
      setError("This job link is invalid.");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true); setError(""); setJob(null);
    getPublicJobBySlug(jobSlug)
      .then(({ data }) => {
        if (!active) return;
        if (!data.success || !data.methodResult || data.methodResult.companyPublicCode !== companyCode) throw new Error("Job not found.");
        setJob(data.methodResult);
      })
      .catch((e) => active && setError((e as Error).message || "Job not found."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [jobSlug, companyCode]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg"><Stack direction="row" alignItems="center" sx={{ height: 72 }}><Button component={Link} to="/careers" color="inherit" startIcon={<ArrowBackRoundedIcon />}>All opportunities</Button></Stack></Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        {loading ? <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}><CircularProgress /></Box>
        : error || !job ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error || "Job not found."}</Alert>
        : <Stack direction={{ xs: "column", md: "row" }} gap={4} alignItems="flex-start">
          <Paper sx={{ flex: 1, width: "100%", p: { xs: 3, md: 5 }, borderRadius: 5, border: "1px solid", borderColor: "divider", boxShadow: "0 16px 50px color-mix(in srgb, var(--mui-palette-common-black) 10%, transparent)" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.lighter", color: "primary.darker", fontWeight: 800 }}>{job.companyName[0]}</Avatar>
              <Box><Typography fontWeight={750}>{job.companyName}</Typography><Typography variant="caption" color="text.secondary">Company code · {job.companyPublicCode}</Typography></Box>
            </Stack>
            <Typography variant="h2" fontWeight={850} sx={{ mt: 4, fontSize: { xs: "2.25rem", md: "3.5rem" }, letterSpacing: "-.045em", lineHeight: 1.08 }}>{job.title}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
              {job.location && <Chip label={job.location} />}{job.employmentType && <Chip label={job.employmentType} />}{job.workplaceType && <Chip label={job.workplaceType} />}{job.referenceCode && <Chip label={job.referenceCode} />}
            </Stack>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>About the role</Typography>
            <Box className="public-job-description" dangerouslySetInnerHTML={description} sx={{ color: "text.secondary", fontSize: "1rem", lineHeight: 1.8, "& h1,& h2,& h3": { color: "text.primary", mt: 3, mb: 1 }, "& ul,& ol": { pl: 3 }, "& p": { mb: 2 } }} />
            {!!job.skills?.length && <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 4 }}>{job.skills.map((skill) => <Chip key={skill} label={skill} color="primary" variant="outlined" />)}</Stack>}
          </Paper>
          <Paper sx={{ width: { xs: "100%", md: 330 }, p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 12px 40px color-mix(in srgb, var(--mui-palette-common-black) 9%, transparent)", position: { md: "sticky" }, top: { md: 28 } }}>
            <BusinessRoundedIcon color="primary" />
            <Typography variant="h6" fontWeight={800} sx={{ mt: 1.5 }}>Interested in this role?</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5, lineHeight: 1.6 }}>Share your details and take the next step in your career.</Typography>
            {job.applicationClosedReason && <Alert severity="warning" sx={{ mb: 2 }}>{job.applicationClosedReason}</Alert>}
            {job.applicationMode === "External" && job.externalApplicationUrl
              ? <Button fullWidth href={job.externalApplicationUrl} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<ArrowOutwardRoundedIcon />} disabled={!job.canApply}>Apply on company site</Button>
              : <Button fullWidth variant="contained" onClick={() => setApplyOpen(true)} disabled={!job.canApply} sx={{ py: 1.35, borderRadius: 2.5, boxShadow: "none" }}>Apply now</Button>}
            <Button fullWidth component={Link} to={`/careers/${companyCode}`} sx={{ mt: 1.2 }}>More jobs at {job.companyName}</Button>
          </Paper>
        </Stack>}
      </Container>
      <PublicJobApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} onSubmitted={setNotice} />
      <Snackbar open={Boolean(notice)} autoHideDuration={8000} onClose={() => setNotice("")}><Alert severity="success" variant="filled" onClose={() => setNotice("")}>{notice}</Alert></Snackbar>
    </Box>
  );
};
