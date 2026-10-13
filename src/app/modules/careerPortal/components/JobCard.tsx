import {
  ArrowForwardRounded,
  LocationOnRounded,
  WorkOutlineRounded,
} from "@mui/icons-material";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PublicJobSummary } from "../../applynow/publicCareerTypes";
import { SaveJobButton } from "./SaveJobButton";
import { Btn } from "../../../shared/components/ui";
import { CompanyLogo } from "./CompanyLogo";

export const JobCard = ({ job, onSavedChange }: {
  job: PublicJobSummary;
  onSavedChange?: (saved: boolean) => void;
}) => {
  const navigate = useNavigate();
  return (
    <Card
      component="article"
      onClick={() => navigate(`/careers/${job.companyPublicCode}/jobs/${job.slug}`)}
      sx={{
        p: { xs: 2, sm: 2.25, md: 2.5 },
        borderRadius: { xs: 3, sm: 4 },
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 8px 30px color-mix(in srgb, var(--mui-palette-common-black) 6%, transparent)",
        cursor: "pointer",
        transition: "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
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
              </Stack>
              <Typography variant="h6" fontWeight={850} letterSpacing="-.025em" sx={{ fontSize: { sm: "1.35rem" }, lineHeight: 1.25 }}>{job.title}</Typography>
              <Typography color="text.secondary" fontWeight={650} sx={{ mt: 0.4 }}>{job.companyName}</Typography>
            </Box>
            <SaveJobButton publicJobId={job.publicJobId} onChange={onSavedChange} />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ mt: 1.25 }}>
            {job.location && <Chip size="small" icon={<LocationOnRounded />} label={job.location} />}
            {job.employmentType && <Chip size="small" icon={<WorkOutlineRounded />} label={job.employmentType} />}
            {job.workplaceType && <Chip size="small" label={job.workplaceType} />}
            {job.experienceMin != null && <Chip size="small" label={`${job.experienceMin}–${job.experienceMax ?? job.experienceMin}+ yrs`} />}
          </Stack>
          {(job.summary || job.shortDescription) && (
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.55, fontSize: { xs: "0.875rem", sm: "inherit" }, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {job.summary || job.shortDescription}
            </Typography>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={1} sx={{ mt: 1.5 }}>
            <Stack direction="row" gap={0.7} flexWrap="wrap" sx={{ minWidth: 0 }}>
              {job.skills?.slice(0, 4).map((skill) => <Chip key={skill} size="small" variant="outlined" label={skill} />)}
            </Stack>
            <Btn endIcon={<ArrowForwardRounded />} sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "auto" } }}>View role</Btn>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};
