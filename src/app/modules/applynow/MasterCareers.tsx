import {
  Alert, Avatar, Box, Button, Card, Chip, CircularProgress, Container,
  InputAdornment, Stack, TextField, Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCompanyPublicJobs, getPublicJobs } from "./publicCareerService";
import { PublicJobSummary } from "./publicCareerTypes";

export const MasterCareers = () => {
  const [jobs, setJobs] = useState<PublicJobSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { companyCode } = useParams();
  const navigate = useNavigate();
  const validCompanyCode = !companyCode || /^\d{6}$/.test(companyCode);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setJobs([]);
    if (!validCompanyCode) {
      setError("This company careers link is invalid. Company links use a 6-digit code.");
      setLoading(false);
      return () => { active = false; };
    }
    const request = companyCode
      ? getCompanyPublicJobs(companyCode, { search, pageSize: 50 })
      : getPublicJobs({ search, pageSize: 50 });
    request
      .then(({ data }) => {
        if (!active) return;
        if (!data.success) throw new Error(data.message || "Jobs could not be loaded.");
        setJobs(data.methodResults ?? []);
      })
      .catch((reason) => {
        if (!active) return;
        setJobs([]);
        setError((reason as Error).message || "Jobs could not be loaded.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [search, companyCode, validCompanyCode]);

  const companyName = useMemo(
    () => (companyCode && jobs.length ? jobs[0].companyName : ""),
    [companyCode, jobs],
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Box component="header" sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 72 }}>
            <Stack component={Link} to="/careers" direction="row" alignItems="center" spacing={1.2} sx={{ color: "text.primary", textDecoration: "none" }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2.5, display: "grid", placeItems: "center", color: "primary.contrastText", background: "linear-gradient(135deg,var(--mui-palette-primary-light),var(--mui-palette-primary-dark))", boxShadow: "0 8px 20px color-mix(in srgb, var(--mui-palette-primary-main) 28%, transparent)" }}>
                <AutoAwesomeRoundedIcon fontSize="small" />
              </Box>
              <Typography fontWeight={800}>Codeji Careers</Typography>
            </Stack>
            {companyCode && <Button component={Link} to="/careers" color="inherit">Explore all jobs</Button>}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Box sx={{
          overflow: "hidden", position: "relative", borderRadius: { xs: 4, md: 6 },
          p: { xs: 3.5, md: 7 }, color: "#fff",
          background: "linear-gradient(125deg,var(--mui-palette-primary-darker) 0%,var(--mui-palette-primary-dark) 52%,var(--mui-palette-primary-main) 100%)",
          boxShadow: "0 24px 70px color-mix(in srgb, var(--mui-palette-primary-main) 24%, transparent)",
        }}>
          <Box sx={{ position: "absolute", width: 330, height: 330, borderRadius: "50%", right: -80, top: -170, bgcolor: "rgba(255,255,255,.1)" }} />
          <Chip label={companyCode ? "COMPANY CAREERS" : "YOUR NEXT CHAPTER"} sx={{ mb: 2.5, color: "#fff", bgcolor: "rgba(255,255,255,.13)", fontWeight: 700, letterSpacing: 1 }} />
          <Typography variant="h2" fontWeight={850} sx={{ maxWidth: 760, fontSize: { xs: "2.35rem", md: "4rem" }, lineHeight: 1.06, letterSpacing: "-.045em" }}>
            {companyCode ? (companyName ? `Grow with ${companyName}` : "Build your future with us") : "Do work that moves you forward."}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 650, color: "rgba(255,255,255,.76)", fontSize: { md: "1.08rem" }, lineHeight: 1.7 }}>
            {companyCode ? "Discover open roles, meet your next challenge, and bring your best ideas to a team where they matter." : "Explore thoughtful opportunities from ambitious teams and find a role built around your strengths."}
          </Typography>
        </Box>

        <Box sx={{ mt: { xs: 4, md: 6 } }}>
          <TextField
            fullWidth value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, skill, or location"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }}
            sx={{ maxWidth: 760, "& .MuiOutlinedInput-root": { height: 58, bgcolor: "background.paper", borderRadius: 3, boxShadow: "0 8px 30px color-mix(in srgb, var(--mui-palette-common-black) 9%, transparent)", "& fieldset": { borderColor: "divider" } } }}
          />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mt: 5, mb: 2.5 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} letterSpacing="-.03em">Open positions</Typography>
            <Typography color="text.secondary" sx={{ mt: .5 }}>{loading ? "Finding opportunities…" : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} available`}</Typography>
          </Box>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={2}>
            {jobs.map((job) => (
              <Card key={job.publicJobId} onClick={() => navigate(`/careers/${job.companyPublicCode}/jobs/${job.slug}`)}
                sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "background.paper", borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 8px 30px color-mix(in srgb, var(--mui-palette-common-black) 7%, transparent)", cursor: "pointer", transition: ".22s ease", "&:hover": { transform: "translateY(-3px)", borderColor: "primary.main", boxShadow: "0 18px 45px color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent)" } }}>
                <Stack direction={{ xs: "column", md: "row" }} gap={3} alignItems={{ md: "center" }}>
                  <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.lighter", color: "primary.darker", fontWeight: 800 }}>{job.companyName?.[0]?.toUpperCase() || <BusinessRoundedIcon />}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={800} letterSpacing="-.02em">{job.title}</Typography>
                    <Stack direction="row" alignItems="center" spacing={.7} sx={{ mt: .7, color: "text.secondary" }}>
                      <BusinessRoundedIcon sx={{ fontSize: 17 }} /><Typography fontWeight={600}>{job.companyName}</Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                      {job.location && <Chip icon={<LocationOnRoundedIcon />} label={job.location} />}
                      {job.employmentType && <Chip icon={<WorkOutlineRoundedIcon />} label={job.employmentType} />}
                      {job.workplaceType && <Chip label={job.workplaceType} />}
                      {job.skills?.slice(0, 3).map((skill) => <Chip key={skill} label={skill} />)}
                    </Stack>
                  </Box>
                  <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 2.5, px: 2.5, boxShadow: "none" }}>View role</Button>
                </Stack>
              </Card>
            ))}
            {!jobs.length && !error && <Box sx={{ textAlign: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 4, py: 8 }}><Typography variant="h6" fontWeight={750}>No openings found</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Try a different search or check back soon.</Typography></Box>}
          </Stack>
        )}
      </Container>
    </Box>
  );
};
