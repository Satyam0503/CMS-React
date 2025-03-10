import { Close } from "@mui/icons-material";
import { Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../components/CustomisedModal";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { Applicant } from "../../../../../utils/common_types";
import { FC } from "react";
import {
  applicationStatusMapper,
  convertMonthsToYear,
  dateFormatter,
  getApplicationStatusClass,
} from "../../../../../utils/common";
import { StyleStatus } from "../../../components/StyledStatus";
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
  const className = getApplicationStatusClass(applicantData.activityType);

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Stack justifyContent={"space-between"} direction={"row"}>
          <Typography variant="h5">
            {applicantData.firstName + " " + applicantData.lastName}
          </Typography>
          <CustomIconButton icon={<Close />} handleClick={handleClose} />
        </Stack>
        <Grid
          container
          display={"flex"}
          direction={"column"}
          gap={1}
          flexWrap={"inherit"}
        >
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
                {convertMonthsToYear(applicantData.experience)}
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
                <StyleStatus
                  label={applicationStatusMapper[applicantData.activityType]}
                  className={className}
                />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <PdfPreview pdfUrl={applicantData.fullApplicantResumePath} />
      </Stack>
    </CustomisedModal>
  );
};
