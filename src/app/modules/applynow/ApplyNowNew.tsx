import {
  Typography,
  Grid,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Container,
  Box,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useState } from "react";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import FooterNew from "./FooterNew";
import { SingleBannerNew } from "./SingleBannerNew";
import ApplicationForm from "./ApplicationForm";

type Props = {
  className: string;
};

export default function ApplyNowNew() {
  const intl = useIntl();
  const [jobPositionsList, setJobPositionsList] = useState<any[]>([]);
  return (
    <>
      <Grid container display={"flex"} justifyContent={"space-between"}>
        <Grid item xs={12} textAlign={"center"}>
          <SingleBannerNew title="Apply " titleorange={"Now"} />
        </Grid>
        <Container>
          <Grid container>
            <Grid item display={{ xs: "none", md: "block" }} md={6}>
              <img
                src={toAbsoluteUrl("media/auth/proud_coder.svg")}
                width={"100%"}
                height={"100%"}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              p={{ xs: 2, md: 5 }}
              borderRadius={2}
              display={"flex"}
              flexDirection={"column"}
              gap={2}
              margin={"auto"}
            >
              {/* <JobDescription /> */}
              <ApplicationForm />
            </Grid>
          </Grid>
        </Container>

        <Grid item xs={12} width={"100%"}>
          <FooterNew />
        </Grid>
      </Grid>
    </>
  );
}
