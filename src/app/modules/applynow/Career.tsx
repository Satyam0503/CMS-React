import {
  Stack,
  Container,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { CareerHeader } from "./Component/CareerHeader";
import CalendarHero from './Component/CareerHero.js';
import WhyJoin from './Component/WhyJoin.js'
import Footer from "./Component/Footer.js";
import FindJobsHeader from "./Component/FindJobsHeader.js";
import JobSearchCareer from "./Component/JobSearchCareer.js";

export const Career = () => {
  const { id } = useParams();
  if (id) localStorage.setItem("clientId", id);
  // const captchaRef = useRef<ReCAPTCHA>(null);

  return (
    <Stack sx={{ marginTop: '70px' }}>
      <CareerHeader />
      <Container className="p-0">
        <CalendarHero />
        <Stack sx={{ padding: { xs: '0 16px', sm: '0 20px ', md: '0 40px' }, marginBottom: '40px' }} spacing={8}>
          <WhyJoin />
          <FindJobsHeader />
          <JobSearchCareer />
        </Stack>
      </Container >
      <Grid size={12} sx={{
        width: "100%"
      }}>
        <Footer />
      </Grid>
    </Stack >
  );
}
