import {
  AutoAwesomeRounded,
  BusinessRounded,
  FilterListRounded,
  LocationOnRounded,
  SearchRounded,
  TuneRounded,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  Container,
  Drawer,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { PublicJobSummary } from "../../applynow/publicCareerTypes";
import { CareerHeader } from "../components/CareerHeader";
import { JobCard } from "../components/JobCard";
import { SubscribeModal } from "../components/SubscribeModal";
import { discoverJobs, getCompanies, getCompanyProfile, getJobLocations, getVisitorPreferences, trackCareerEvent } from "../services/careerPortalService";
import { getCareerSession, getCareerVisitorToken } from "../hooks/useCareerVisitor";
import { PublicCompanyProfile } from "../types/careerPortalTypes";
import { buildCareerSearchParams, CareerSearchFilters } from "../utils/careerSearch";
import { Alrt, Btn, Txt } from "../../../shared/components/ui";
import { CircularLoader } from "../../../shared/components";
import { CompanyLogo } from "../components/CompanyLogo";

type Filters = CareerSearchFilters;

const defaults: Filters = {
  location: "", workplaceType: "", employmentType: "", experienceMin: "",
  department: "", industry: "", skills: "", datePostedDays: "",
  featured: false, urgentHiring: false, walkIn: false, sort: "relevance",
};

const FilterContent = ({
  filters,
  setFilters,
  reset,
  locations,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  reset: () => void;
  locations: string[];
}) => (
  <Stack spacing={2.25}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
      <Stack direction="row" spacing={1} alignItems="center"><TuneRounded color="primary" /><Typography variant="h6" fontWeight={850}>Filters</Typography></Stack>
      <Btn size="small" onClick={reset} sx={{ minWidth: 64 }}>Reset</Btn>
    </Stack>
    <Typography variant="body2" color="text.secondary" sx={{ mt: -0.75, lineHeight: 1.55 }}>Narrow roles by location, work style, and experience.</Typography>
    <Autocomplete
      freeSolo
      options={locations}
      value={filters.location}
      onInputChange={(_, value) => setFilters((x) => ({ ...x, location: value }))}
      onChange={(_, value) => setFilters((x) => ({ ...x, location: value ?? "" }))}
      renderInput={(params) => <Txt {...params} label="Search location" placeholder="City, state, or remote" />}
    />
    <Txt select label="Work arrangement" value={filters.workplaceType} onChange={(e) => setFilters((x) => ({ ...x, workplaceType: e.target.value }))}>
      <MenuItem value="">Any arrangement</MenuItem><MenuItem value="Remote">Remote</MenuItem><MenuItem value="Hybrid">Hybrid</MenuItem><MenuItem value="On-site">On-site</MenuItem>
    </Txt>
    <Txt select label="Employment type" value={filters.employmentType} onChange={(e) => setFilters((x) => ({ ...x, employmentType: e.target.value }))}>
      <MenuItem value="">Any type</MenuItem><MenuItem value="Full-time">Full-time</MenuItem><MenuItem value="Part-time">Part-time</MenuItem><MenuItem value="Contract">Contract</MenuItem><MenuItem value="Internship">Internship</MenuItem>
    </Txt>
    <Txt label="Minimum experience" type="number" value={filters.experienceMin} onChange={(e) => setFilters((x) => ({ ...x, experienceMin: e.target.value }))} />
    <Txt label="Department" value={filters.department} onChange={(e) => setFilters((x) => ({ ...x, department: e.target.value }))} />
    <Txt label="Industry" value={filters.industry} onChange={(e) => setFilters((x) => ({ ...x, industry: e.target.value }))} />
    <Txt label="Skills (comma separated)" value={filters.skills} onChange={(e) => setFilters((x) => ({ ...x, skills: e.target.value }))} />
    <Txt select label="Date posted" value={filters.datePostedDays} onChange={(e) => setFilters((x) => ({ ...x, datePostedDays: e.target.value }))}>
      <MenuItem value="">Any time</MenuItem><MenuItem value="1">Past 24 hours</MenuItem><MenuItem value="7">Past week</MenuItem><MenuItem value="30">Past month</MenuItem>
    </Txt>
    <Divider />
    <Stack spacing={0.25}>
      <Typography variant="overline" color="text.secondary" fontWeight={800}>Role preferences</Typography>
      <FormControlLabel sx={{ m: 0, minHeight: 36 }} control={<Switch checked={filters.featured} onChange={(e) => setFilters((x) => ({ ...x, featured: e.target.checked }))} />} label="Featured roles" />
      <FormControlLabel sx={{ m: 0, minHeight: 36 }} control={<Switch checked={filters.urgentHiring} onChange={(e) => setFilters((x) => ({ ...x, urgentHiring: e.target.checked }))} />} label="Urgent hiring" />
      <FormControlLabel sx={{ m: 0, minHeight: 36 }} control={<Switch checked={filters.walkIn} onChange={(e) => setFilters((x) => ({ ...x, walkIn: e.target.checked }))} />} label="Walk-in roles" />
    </Stack>
  </Stack>
);

export const CareerMarketplace = () => {
  const { companyCode } = useParams();
  const theme = useTheme();
  // Keep the filter drawer until there is enough width for a useful sidebar and
  // readable job cards side by side.
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(defaults);
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<PublicJobSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [profile, setProfile] = useState<PublicCompanyProfile | null>(null);
  const [featuredCompanies, setFeaturedCompanies] = useState<PublicCompanyProfile[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [recentJobs] = useState<PublicJobSummary[]>(() => {
    try { return JSON.parse(localStorage.getItem("career_recent_jobs") || "[]"); }
    catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const validCode = !companyCode || /^\d{6}$/.test(companyCode);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!companyCode || !validCode) { setProfile(null); return; }
    getCompanyProfile(companyCode).then(({ data }) => setProfile(data.methodResult ?? null)).catch(() => setProfile(null));
  }, [companyCode, validCode]);

  useEffect(() => {
    if (companyCode) return;
    getCompanies()
      .then(({ data }) => setFeaturedCompanies((data.methodResults ?? []).slice(0, 6)))
      .catch(() => setFeaturedCompanies([]));
  }, [companyCode]);

  useEffect(() => {
    getJobLocations(companyCode)
      .then(({ data }) => setLocations(data.methodResults ?? []))
      .catch(() => setLocations([]));
  }, [companyCode]);

  useEffect(() => {
    if (!validCode) {
      setError("Company career links use a persistent six-digit code.");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    const params = buildCareerSearchParams(debouncedSearch, page, filters);
    discoverJobs(companyCode, params)
      .then(({ data }) => {
        if (!active) return;
        if (!data.success) throw new Error(data.message || "Jobs could not be loaded.");
        setJobs(data.methodResults ?? []);
        setTotal(data.totalRecords ?? 0);
        if (debouncedSearch || activeFilters > 0)
          trackCareerEvent(
            debouncedSearch ? "SearchPerformed" : "FilterApplied",
            getCareerVisitorToken(),
            undefined,
            companyCode,
          );
      })
      .catch((reason) => active && setError(reason?.response?.data?.message || reason.message || "Jobs could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [companyCode, debouncedSearch, filters, page, validCode]);

  useEffect(() => setPage(1), [debouncedSearch, filters]);
  useEffect(() => {
    if (sessionStorage.getItem("career_subscribe_seen") || getCareerSession()) return;
    let timer = 0;
    let active = true;
    getVisitorPreferences(getCareerVisitorToken())
      .then(({ data }) => {
        if (!active || data.methodResult?.suppressSubscribePopup) return;
        timer = window.setTimeout(() => {
          setSubscribeOpen(true);
          sessionStorage.setItem("career_subscribe_seen", "1");
        }, 12000);
      })
      .catch(() => {
        if (!active) return;
        timer = window.setTimeout(() => setSubscribeOpen(true), 12000);
      });
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, []);

  const activeFilters = useMemo(
    () => Object.values(filters).filter((x) => x !== "" && x !== false && x !== "relevance").length,
    [filters],
  );
  const companyName = profile?.displayName || jobs[0]?.companyName;
  useEffect(() => { document.title = companyName ? `${companyName} Careers` : "Careers"; }, [companyName]);

  return (
    <Box sx={{ minHeight: "100vh", color: "text.primary", background: "radial-gradient(circle at 0% 18%, color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent), transparent 32%), radial-gradient(circle at 100% 0%, rgba(129,140,248,.10), transparent 30%), linear-gradient(180deg, #fbfdfd 0%, #edf5f5 100%)" }}>
      <CareerHeader />
      <Box sx={{ pt: { xs: 2.5, sm: 4, md: 7 }, pb: { xs: 4, md: 8 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: 4, md: 6 },
              p: { xs: 3, sm: 5, md: 7 },
              minHeight: { xs: 310, sm: 350, md: 390 },
              display: "flex",
              alignItems: "center",
              color: "#fff",
              background: profile?.coverImageUrl
                ? `linear-gradient(105deg, rgba(14,18,42,.94), rgba(74,45,160,.72)), url("${profile.coverImageUrl}") center/cover`
                : "radial-gradient(circle at 88% 5%, rgba(255,255,255,.17) 0 12%, transparent 12.2%), linear-gradient(125deg, #17142f 0%, var(--mui-palette-primary-dark) 52%, var(--mui-palette-primary-main) 100%)",
              boxShadow: "0 26px 70px color-mix(in srgb, var(--mui-palette-primary-main) 24%, transparent)",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
              <Chip icon={companyCode ? <BusinessRounded /> : <AutoAwesomeRounded />} label={companyCode ? "COMPANY CAREERS" : "CURATED OPPORTUNITIES"} sx={{ bgcolor: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.24)", fontWeight: 800 }} />
              <Typography variant="h1" sx={{ mt: 2.5, color: "#fff !important", textShadow: "0 3px 18px rgba(0,0,0,.32)", fontWeight: 900, letterSpacing: "-.055em", lineHeight: 1.02, fontSize: { xs: "2.65rem", sm: "3.5rem", md: "4.8rem" } }}>
                {companyCode ? `Build what’s next with ${companyName || "us"}.` : "Find work worth showing up for."}
              </Typography>
              <Typography sx={{ mt: 2, maxWidth: 680, color: "rgba(255,255,255,.90)", textShadow: "0 2px 12px rgba(0,0,0,.20)", fontSize: { md: "1.12rem" }, lineHeight: 1.75 }}>
                {profile?.shortDescription || "Search ambitious teams, useful work, and roles designed around where you want your career to go."}
              </Typography>
              <Btn onClick={() => setSubscribeOpen(true)} color="inherit" sx={{ mt: 3, color: "primary.dark", bgcolor: "#fff", "&:hover": { bgcolor: "grey.100" } }}>
                Get matching jobs
              </Btn>
            </Box>
          </Box>

          <Paper sx={{ mx: { xs: 0, sm: 2, md: 5 }, mt: { xs: 3, md: -3.5 }, position: "relative", zIndex: 2, p: { xs: 1, sm: 1.25 }, borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 18px 50px color-mix(in srgb, var(--mui-palette-common-black) 10%, transparent)" }}>
            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              <Txt fullWidth value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Job title, skill, company, or keyword" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} sx={{ "& fieldset": { border: 0 } }} />
              <Txt select value={filters.sort} onChange={(e) => setFilters((x) => ({ ...x, sort: e.target.value }))} sx={{ minWidth: { sm: 190 }, "& fieldset": { border: 0 } }}>
                <MenuItem value="relevance">Most relevant</MenuItem><MenuItem value="newest">Newest first</MenuItem><MenuItem value="oldest">Oldest first</MenuItem><MenuItem value="deadline">Deadline soon</MenuItem><MenuItem value="salary-high">Salary: high to low</MenuItem><MenuItem value="salary-low">Salary: low to high</MenuItem><MenuItem value="most-saved">Most saved</MenuItem><MenuItem value="most-viewed">Most viewed</MenuItem>
              </Txt>
              {!desktop && <Btn variant="outlined" startIcon={<FilterListRounded />} onClick={() => setDrawer(true)}>Filters {activeFilters ? `(${activeFilters})` : ""}</Btn>}
            </Stack>
          </Paper>

          {!companyCode && featuredCompanies.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h4" fontWeight={900} letterSpacing="-.03em">Companies hiring now</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2.5, overflowX: "auto", pb: 1 }}>
                {featuredCompanies.map((company) => (
                  <Paper key={company.publicCompanyCode} component="a" href={`/careers/${company.publicCompanyCode}`} sx={{ minWidth: 235, p: 2.5, borderRadius: 4, border: "1px solid", borderColor: "divider", color: "text.primary", textDecoration: "none", "&:hover": { borderColor: "primary.main" } }}>
                    <CompanyLogo src={company.logoUrl} name={company.displayName} size={52} />
                    <Typography fontWeight={850} sx={{ mt: 1.5 }}>{company.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>{company.industry || company.companySize || "Explore open roles"}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {!companyCode && recentJobs.length > 0 && (
            <Box sx={{ mt: 5 }}>
              <Typography variant="h5" fontWeight={900}>Recently viewed</Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: "auto", pb: 1 }}>
                {recentJobs.slice(0, 4).map((job) => (
                  <Chip key={job.publicJobId} component="a" clickable href={`/careers/${job.companyPublicCode}/jobs/${job.slug}`} label={`${job.title} · ${job.companyName}`} sx={{ height: 42, px: 1 }} />
                ))}
              </Stack>
            </Box>
          )}

          <Stack direction={{ xs: "column", lg: "row" }} alignItems="flex-start" spacing={{ xs: 3, lg: 4 }} sx={{ mt: { xs: 4, md: 6 } }}>
            {desktop && (
              <Paper sx={{ width: 308, flexShrink: 0, p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", position: "sticky", top: 94, bgcolor: "background.paper", boxShadow: "0 14px 34px color-mix(in srgb, var(--mui-palette-common-black) 7%, transparent)" }}>
                <FilterContent filters={filters} setFilters={setFilters} reset={() => setFilters(defaults)} locations={locations} />
              </Paper>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={1} sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="h4" fontWeight={900} letterSpacing="-.035em">Open opportunities</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>{loading ? "Searching..." : `${total} role${total === 1 ? "" : "s"} found`}</Typography>
                </Box>
                {activeFilters > 0 && <Chip label={`${activeFilters} active filter${activeFilters === 1 ? "" : "s"}`} onDelete={() => setFilters(defaults)} />}
              </Stack>
              {error && <Alrt severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>{error}</Alrt>}
              {loading ? <Box sx={{ minHeight: 360 }}><CircularLoader /></Box> : (
                <Stack spacing={2}>
                  {jobs.map((job) => (
                    <JobCard
                      key={job.publicJobId}
                      job={job}
                    />
                  ))}
                  {!jobs.length && !error && (
                    <Paper sx={{ py: 9, px: 3, textAlign: "center", borderRadius: 4, border: "1px dashed", borderColor: "divider" }}>
                      <LocationOnRounded color="primary" sx={{ fontSize: 42 }} />
                      <Typography variant="h5" fontWeight={850} sx={{ mt: 1.5 }}>No exact matches yet</Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>Try broadening your filters or create an alert for this search.</Typography>
                    </Paper>
                  )}
                </Stack>
              )}
              {total > 12 && <Stack alignItems="center" sx={{ mt: 4 }}><Pagination page={page} count={Math.ceil(total / 12)} onChange={(_, value) => setPage(value)} color="primary" /></Stack>}
            </Box>
          </Stack>
          {companyCode && profile && (
            profile.aboutCompanyHtml || profile.shortDescription || profile.values.length > 0 ||
            profile.benefits.length > 0 || profile.industry || profile.companySize ||
            profile.foundedYear || profile.headquarters
          ) && (
            <Box sx={{ mt: { xs: 6, md: 9 } }}>
              <Typography variant="overline" color="primary" fontWeight={900}>LIFE AT {profile.displayName.toUpperCase()}</Typography>
              <Typography variant="h3" fontWeight={950} letterSpacing="-.04em" sx={{ mt: 0.5 }}>Know the team behind the roles</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
                <Paper sx={{ flex: 1.5, p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                  {profile.aboutCompanyHtml ? <Box dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profile.aboutCompanyHtml) }} sx={{ color: "text.secondary", lineHeight: 1.8, "& h1,& h2,& h3": { color: "text.primary" } }} /> : <Typography color="text.secondary">{profile.shortDescription}</Typography>}
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
                    {profile.industry && <Chip label={profile.industry} />}
                    {profile.companySize && <Chip label={`${profile.companySize} people`} />}
                    {profile.foundedYear && <Chip label={`Founded ${profile.foundedYear}`} />}
                    {profile.headquarters && <Chip label={profile.headquarters} />}
                  </Stack>
                </Paper>
                <Stack spacing={3} sx={{ flex: 1 }}>
                  {profile.values.length > 0 && <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}><Typography variant="h6" fontWeight={900}>What we value</Typography><Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>{profile.values.map((value) => <Chip key={value} color="primary" variant="outlined" label={value} />)}</Stack></Paper>}
                  {profile.benefits.length > 0 && <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}><Typography variant="h6" fontWeight={900}>Why people stay</Typography><Stack spacing={1} sx={{ mt: 2 }}>{profile.benefits.slice(0, 6).map((benefit) => <Typography key={benefit} color="text.secondary">• {benefit}</Typography>)}</Stack></Paper>}
                </Stack>
              </Stack>
            </Box>
          )}
        </Container>
      </Box>
      <Drawer anchor="bottom" open={drawer} onClose={() => setDrawer(false)} PaperProps={{ sx: { borderRadius: "28px 28px 0 0", p: 3, maxHeight: "88vh", overflowY: "auto" } }}>
        <FilterContent filters={filters} setFilters={setFilters} reset={() => setFilters(defaults)} locations={locations} />
        <Btn variant="contained" onClick={() => setDrawer(false)} sx={{ mt: 3 }}>Show {total} jobs</Btn>
      </Drawer>
      <SubscribeModal open={subscribeOpen} onClose={() => setSubscribeOpen(false)} companyCode={companyCode} />
    </Box>
  );
};
