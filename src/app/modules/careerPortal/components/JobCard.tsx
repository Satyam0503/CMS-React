import {
  ArrowForwardRounded,
  BusinessRounded,
  LocationOnRounded,
  WorkOutlineRounded,
} from "@mui/icons-material";
import { Avatar, Box, Button, Card, Chip, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PublicJobSummary } from "../../applynow/publicCareerTypes";
import { SaveJobButton } from "./SaveJobButton";

export const JobCard = ({ job, initiallySaved = false, onSavedChange }: {
  job: PublicJobSummary;
  initiallySaved?: boolean;
  onSavedChange?: (saved: boolean) => void;
}) => {
  const navigate = useNavigate();
  return (
    <Card
      component="article"
      onClick={() => navigate(`/careers/${job.companyPublicCode}/jobs/${job.slug}`)}
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 4,
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
      <Stack direction="row" spacing={2.25} alignItems="flex-start">
        <Avatar src={job.companyLogo ?? undefined} sx={{ width: 54, height: 54, bgcolor: "primary.lighter", color: "primary.dark", fontWeight: 900 }}>
          {job.companyName?.[0] ?? <BusinessRounded />}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Box>
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 0.75 }}>
                {job.isFeatured && <Chip size="small" color="primary" label="Featured" />}
                {job.isUrgentHiring && <Chip size="small" color="warning" label="Urgent hiring" />}
                {job.isWalkIn && <Chip size="small" color="success" label="Walk-in" />}
              </Stack>
              <Typography variant="h5" fontWeight={850} letterSpacing="-.025em">{job.title}</Typography>
              <Typography color="text.secondary" fontWeight={650} sx={{ mt: 0.4 }}>{job.companyName}</Typography>
            </Box>
            <SaveJobButton publicJobId={job.publicJobId} initiallySaved={initiallySaved} onChange={onSavedChange} />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 2 }}>
            {job.location && <Chip size="small" icon={<LocationOnRounded />} label={job.location} />}
            {job.employmentType && <Chip size="small" icon={<WorkOutlineRounded />} label={job.employmentType} />}
            {job.workplaceType && <Chip size="small" label={job.workplaceType} />}
            {job.experienceMin != null && <Chip size="small" label={`${job.experienceMin}–${job.experienceMax ?? job.experienceMin}+ yrs`} />}
          </Stack>
          {(job.summary || job.shortDescription) && (
            <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.65 }} noWrap>
              {job.summary || job.shortDescription}
            </Typography>
          )}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2.25 }}>
            <Stack direction="row" gap={0.7} sx={{ overflow: "hidden" }}>
              {job.skills?.slice(0, 4).map((skill) => <Chip key={skill} size="small" variant="outlined" label={skill} />)}
            </Stack>
            <Button endIcon={<ArrowForwardRounded />} sx={{ flexShrink: 0 }}>View role</Button>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};
