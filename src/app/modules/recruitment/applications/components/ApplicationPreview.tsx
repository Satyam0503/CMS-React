import { Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { } from "../../../../../utils/common_types";
import { FC } from "react";
import {
  applicationStatusMapper,
  dateFormatter,
} from "../../../../../utils/common";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import { Applicant } from "../../models";
import { CvPreview } from "./CvPreview";
import clsx from "clsx";
import { ApplicationStatus } from "../../../../../utils/enums";

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
  const { formatMessage: i } = useIntl();
  const experience = (applicantData.experience / 12).toFixed(1);

  return (
    <CustomisedModal open={open} handleClose={handleClose}
      title={applicantData.firstName + " " + applicantData.lastName}
    >
      <Stack spacing={2}>
        <Grid
          container
          direction={"column"}
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "inherit"
          }}>
          <Grid size={12} sx={{
            display: "flex"
          }}>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 600
              }}>
                {i({ id: "JOB.JOB_TITLE" })}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 400
              }}>
                {applicantData.vacancyName || "NA"}
              </Typography>
            </Grid>
          </Grid>
          <Grid size={12} sx={{
            display: "flex"
          }}>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 600
              }}>
                {i({ id: "APPLICATION.WORK_EXP" })}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 400
              }}>
                {i({ id: "PLURAL.YEAR" }, { years: experience })}
              </Typography>
            </Grid>
          </Grid>

          <Grid size={12} sx={{
            display: "flex"
          }}>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 600
              }}>
                {i({ id: "APPLICATION.APPLIED_ON" })}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 400
              }}>
                {dateFormatter(applicantData.applyDate, "DD MMM YYYY hh:mm A")}
              </Typography>
            </Grid>
          </Grid>

          <Grid size={12} sx={{
            display: "flex"
          }}>
            <Grid size={6} sx={{
              fontWeight: 400
            }}>
              <Typography variant="body1" sx={{
                fontWeight: 600
              }}>
                {i({ id: "APPLICATION.STATUS_LABEL" })}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1" sx={{
                fontWeight: 400
              }}>
                <StyleStatus
                  label={applicationStatusMapper[applicantData.activityType]}
                  className={clsx({
                    info: applicantData.activityType === ApplicationStatus.New,
                    warning: [ApplicationStatus.InProgress, ApplicationStatus.OnHold, ApplicationStatus.Shortlisted].includes(applicantData.activityType),
                    success: applicantData.activityType === ApplicationStatus.Selected,
                    danger: applicantData.activityType === ApplicationStatus.Rejected
                  })}
                />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <CvPreview pdfUrl={applicantData.fullApplicantResumePath} />
      </Stack>
    </CustomisedModal>
  );
};
