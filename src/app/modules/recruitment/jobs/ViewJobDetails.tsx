import { FC, memo, useMemo } from "react";
import { JobModal } from "../../../../utils/common_types";
import { CustomisedModal } from "../../components/CustomisedModal";
import CustomisedButton from "../../components/CustomisedButton";
import { FileOpenOutlined } from "@mui/icons-material";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { StyleStatus } from "../../components/StyledStatus";
import { statusDecoder } from "../../../../utils/common";
import { useIntl } from "react-intl";
import DOMPurify from "dompurify";

interface PropsTypes {
  jobData: JobModal;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ViewJobDetails: FC<PropsTypes> = memo(
  ({ open, jobData, setOpen }) => {
    const intl = useIntl();
    const handleClose = () => {
      setOpen(false);
    };

    const sanitizedContent = useMemo(
      () => ({
        __html: DOMPurify.sanitize(jobData.description),
      }),
      [jobData]
    );

    return (
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack spacing={2}>
          <Typography variant="h5">{jobData.title || ""}</Typography>

          <Grid container rowSpacing={1} columnSpacing={1}>
            <Grid xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.ROLE" })}
              </Typography>
            </Grid>
            <Grid xs={8} md={6}>
              <Typography>{jobData.title}</Typography>
            </Grid>
            <Grid xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.VACANCIES" })}
              </Typography>
            </Grid>
            <Grid xs={8} md={6}>
              <Typography>{jobData.vacancies}</Typography>
            </Grid>
            <Grid xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid xs={8} md={6}>
              <Typography>{jobData.jobType}</Typography>
            </Grid>

            <Grid xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
            </Grid>
            <Grid xs={8} md={6}>
              <StyleStatus
                label={statusDecoder(jobData.status as boolean)}
                className={jobData.status ? "success" : "danger"}
              />
            </Grid>
          </Grid>
          <hr />
          <Box component={"div"} dangerouslySetInnerHTML={sanitizedContent} />
          <Stack direction={"row"} justifyContent={"flex-end"} mt={2} gap={1}>
            <CustomisedButton
              variant="contained"
              label="Submissions"
              Icon={<FileOpenOutlined />}
              iconPosition="start"
            />
            <CustomisedButton
              variant="outlined"
              label="Close"
              handleClick={handleClose}
            />
          </Stack>
        </Stack>
      </CustomisedModal>
    );
  }
);
