import { Close, Download } from "@mui/icons-material";
import { Container, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import { CustomIconButton } from "../../components/CustomIconButton";
import { Applicant } from "../../../../utils/common_types";
import { FC } from "react";
import {
  applicationStatusDecoder,
  dateFormatter,
  getApplicationStatusClass,
} from "../../../../utils/common";
import { StyleStatus } from "../../components/StyledStatus";
import { PdfPreview } from "./PdfPreview";

interface PropsType {
  open: boolean;
  handleClose: () => void;
  applicantData: Applicant;
}

export const ApplicationPreview: FC<PropsType> = ({
  open,
  handleClose,
  applicantData,
}) => {
  const intl = useIntl();
  const status = applicationStatusDecoder(applicantData.status);
  const className = getApplicationStatusClass(status);
  const experienceSuffix = applicantData.experience > 1 ? "Years" : "Year";

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Grid
        container
        display={"flex"}
        direction={"column"}
        gap={1}
        flexWrap={"inherit"}
        mb={2}
      >
        <Grid item xs={12} display={"flex"} justifyContent={"space-between"}>
          <Typography variant="h5">
            {applicantData.firstName + " " + applicantData.lastName}
          </Typography>
          <CustomIconButton icon={<Close />} handleClick={handleClose} />
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "JOB.TITLE" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              {applicantData.vacancyName || "NA"}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "PROFILE.EMPLOYMENT" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              {applicantData.experience + " " + experienceSuffix}
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "USER.APPLICATION.DATE" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              {dateFormatter(applicantData.applyDate, "DD MMM YYYY hh:mm A")}
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6} fontWeight={400}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "PROFILE.STATUS" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              <StyleStatus label={status} className={className} />
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <PdfPreview pdfUrl={applicantData.fullApplicantResumePath} />
    </CustomisedModal>
  );
};
