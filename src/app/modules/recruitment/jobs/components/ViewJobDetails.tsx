import { FC, memo } from "react";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { Close } from "@mui/icons-material";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import { sanitizeHtmlContent, statusDecoder } from "../../../../../utils/common";
import { useIntl } from "react-intl";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { JobModal } from "../../models";

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

    return (
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack spacing={2}>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Typography variant="h5">{jobData.title || ""}</Typography>
            <CustomIconButton icon={<Close />} handleClick={handleClose} />
          </Stack>

          <Grid container spacing={1}>
            <Grid item xs={4} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.ROLE" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <Typography>{jobData.title}</Typography>
            </Grid>
            <Grid item xs={4} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "JOB.VACANCIES" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <Typography>{jobData.vacancies}</Typography>
            </Grid>
            <Grid item xs={4} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <Typography>{jobData.jobType}</Typography>
            </Grid>

            <Grid item xs={4} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <StyleStatus
                label={statusDecoder(jobData.status as boolean)}
                className={jobData.status ? "success" : "danger"}
              />
            </Grid>
          </Grid>
          <hr />
          <Box
            component={"div"}
            dangerouslySetInnerHTML={{
              __html:sanitizeHtmlContent(jobData.description)
            }}
            sx={{
              maxHeight: "400px",
              overflowY: "scroll",
            }}
          />
          <Stack direction={"row"} justifyContent={"flex-end"} mt={2} gap={1}>
            {/* <CustomisedButton
              variant="contained"
              label="Submissions"
              Icon={<FileOpenOutlined />}
              iconPosition="start"
            /> */}
            <CustomisedButton
              variant="outlined"
              label={intl.formatMessage({id:"BUTTON.CLOSE"})}
              handleClick={handleClose}
            />
          </Stack>
        </Stack>
      </CustomisedModal>
    );
  }
);
