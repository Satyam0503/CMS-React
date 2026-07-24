import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Container,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CareerHeader } from "./Component/CareerHeader";
import CalendarHero from './Component/CareerHero.js';
import WhyJoin from './Component/WhyJoin.js'
import Footer from "./Component/Footer.js";
import FindJobsHeader from "./Component/FindJobsHeader.js";
import JobSearchCareer from "./Component/JobSearchCareer.js";
import { getRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";

type PublicCareerCompany = {
  companyId: string;
  companyName: string;
  careerSlug: string;
  companyLogo?: string;
};

export const Career = () => {
  const { id, slug } = useParams();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const resolveCompany = async () => {
      setIsReady(false);
      setError("");
      try {
        if (slug) {
          const { data } = await getRequest<ResponseData<PublicCareerCompany>>(
            `api/Company/career/${encodeURIComponent(slug)}`,
          );
          if (!data.success || !data.methodResult?.companyId)
            throw new Error(data.message || "Career portal not found.");
          localStorage.setItem("clientId", data.methodResult.companyId);
        } else if (id) {
          localStorage.setItem("clientId", id);
        } else {
          const { data } = await getRequest<ResponseData<PublicCareerCompany>>(
            "api/Company/career",
          );
          if (!data.success || !data.methodResult?.companyId)
            throw new Error(data.message || "Career portal not found.");
          localStorage.setItem("clientId", data.methodResult.companyId);
        }
        if (active) setIsReady(true);
      } catch (reason) {
        if (active) setError((reason as Error).message || "Career portal not found.");
      }
    };
    void resolveCompany();
    return () => { active = false; };
  }, [id, slug]);

  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  if (!isReady) return <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
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
