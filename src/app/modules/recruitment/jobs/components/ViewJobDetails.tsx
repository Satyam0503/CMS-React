import { FC, memo } from "react";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import {
  JobTypeMapper,
  sanitizeHtmlContent,
  statusDecoder,
} from "../../../../../utils/common";
import { useIntl } from "react-intl";
import { JobModal } from "../../models";

interface PropsTypes {
  jobData: JobModal;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ViewJobDetails: FC<PropsTypes> = memo(({ open, jobData, setOpen }) => {
  const { formatMessage: i } = useIntl();
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <CustomisedModal open={open} handleClose={handleClose}
      title={jobData.title || ""}
    >
      <Grid container spacing={1}>
        <Grid
          size={{
            xs: 4,
            md: 6
          }}>
          <Typography variant="body1" sx={{
            fontWeight: 600
          }}>
            {i({ id: "FORM.ROLE" })}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 8,
            md: 6
          }}>
          <Typography>{jobData.title}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 4,
            md: 6
          }}>
          <Typography variant="body1" sx={{
            fontWeight: 600
          }}>
            {i({ id: "JOB.VACANCIES" })}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 8,
            md: 6
          }}>
          <Typography>{jobData.vacancies}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 4,
            md: 6
          }}>
          <Typography variant="body1" sx={{
            fontWeight: 600
          }}>
            {i({ id: "JOB.TYPE" })}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 8,
            md: 6
          }}>
          <Typography>{i({ id: JobTypeMapper[jobData.jobType] })}</Typography>
        </Grid>

        <Grid
          size={{
            xs: 4,
            md: 6
          }}>
          <Typography variant="body1" sx={{
            fontWeight: 600
          }}>
            {i({ id: "STATUS" })}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 8,
            md: 6
          }}>
          <StyleStatus
            label={statusDecoder(jobData.status as boolean)}
            className={jobData.status ? "success" : "danger"}
          />
        </Grid>
      </Grid>
      <Divider className="my-4" />
      <Box
        component="div"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtmlContent(jobData.description),
        }}
      />
      <Stack className="flex-row justify-content-end mt-4 gap-4">
        <CustomisedButton
          variant="outlined"
          label={i({ id: "BUTTON.CLOSE" })}
          handleClick={handleClose}
        />
      </Stack>
    </CustomisedModal>
  );
}
);
