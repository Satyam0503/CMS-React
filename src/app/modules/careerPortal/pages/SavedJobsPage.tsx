import {
  BookmarkRounded,
  DeleteOutlineRounded,
  LocationOnRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CareerHeader } from "../components/CareerHeader";
import { useCareerVisitor } from "../hooks/useCareerVisitor";
import { getSavedJobs, unsaveJob } from "../services/careerPortalService";
import { SavedCareerJob } from "../types/careerPortalTypes";
import { Alrt, Btn } from "../../../shared/components/ui";
import { CircularLoader } from "../../../shared/components";

export const SavedJobsPage = () => {
  const { visitorToken, sessionToken } = useCareerVisitor();
  const [jobs, setJobs] = useState<SavedCareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getSavedJobs(visitorToken, sessionToken)
      .then(({ data }) => setJobs(data.methodResults ?? []))
      .catch((reason) => setError(reason?.response?.data?.message || "Saved jobs could not be loaded."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [visitorToken, sessionToken]);

  const remove = async (id: string) => {
    await unsaveJob(id, visitorToken, sessionToken);
    setJobs((items) => items.filter((x) => x.publicJobId !== id));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <CareerHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 52, height: 52, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "primary.lighter", color: "primary.dark" }}><BookmarkRounded /></Box>
          <Box><Typography variant="h3" fontWeight={950} letterSpacing="-.04em">Saved jobs</Typography><Typography color="text.secondary">Keep promising opportunities in one calm place.</Typography></Box>
        </Stack>
        {error && <Alrt severity="error" sx={{ mt: 3 }}>{error}</Alrt>}
        {loading ? <Box sx={{ minHeight: 320 }}><CircularLoader /></Box> : (
          <Stack spacing={2} sx={{ mt: 4 }}>
            {jobs.map((job) => (
              <Paper key={job.publicJobId} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
                  <Box>
                    <Typography component={Link} to={`/careers/${job.companyCode}/jobs/${job.slug}`} variant="h5" fontWeight={900} color="text.primary" sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}>{job.title}</Typography>
                    <Typography color="text.secondary" fontWeight={650} sx={{ mt: 0.5 }}>{job.companyName}</Typography>
                    {!!job.locations?.length && <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.5, color: "text.secondary" }}><LocationOnRounded fontSize="small" /><Typography variant="body2">{job.locations.join(", ")}</Typography></Stack>}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Btn component={Link} to={`/careers/${job.companyCode}/jobs/${job.slug}`} variant="contained">View job</Btn>
                    <IconButton aria-label="Remove saved job" onClick={() => remove(job.publicJobId)}><DeleteOutlineRounded /></IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {!jobs.length && !error && <Paper sx={{ p: 7, textAlign: "center", borderRadius: 4, border: "1px dashed", borderColor: "divider", background: "linear-gradient(145deg, background.paper, color-mix(in srgb, var(--mui-palette-primary-main) 5%, var(--mui-palette-background-paper)))" }}><BookmarkRounded color="primary" sx={{ fontSize: 52 }} /><Typography variant="h5" fontWeight={850} sx={{ mt: 1.5 }}>Nothing saved yet</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Save interesting roles while you explore. They will stay here after refresh.</Typography><Btn component={Link} to="/careers" variant="contained" sx={{ mt: 3 }}>Explore jobs</Btn></Paper>}
          </Stack>
        )}
      </Container>
    </Box>
  );
};
