import {
  Add,
  EditOutlined,
  FileCopyOutlined,
  FileOpenOutlined,
  FileUpload,
  LinkOutlined,
  Visibility,
} from "@mui/icons-material";
import { Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../modules/components/CustomisedModal";
import CustomisedButton from "../../modules/components/CustomisedButton";

export default function JobDescription() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <IconButton onClick={() => setOpen(true)}>
        <FileCopyOutlined />
      </IconButton>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Grid container display={"flex"} direction={"column"} gap={1}>
          <Grid item xs={12}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "JOB.DESCRIPTION" })}
            </Typography>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "FORM.TITLE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.ROLE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.LEVEL" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.VACANCIES" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.DEPARTMENT" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.MODE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.REQ.QUALIFICATION" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>

          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField />
            </Grid>
          </Grid>
        </Grid>

        <hr />

        <Grid container></Grid>
        <Grid
          item
          xs={12}
          display={"flex"}
          justifyContent={"flex-end"}
          mt={1}
          gap={1}
        >
          <CustomisedButton
            variant="outlined"
            size="medium"
            label="Page URL"
            Icon={<LinkOutlined />}
            iconPosition="start"
          />
          <CustomisedButton
            variant="contained"
            size="medium"
            label="Submissions"
            Icon={<FileOpenOutlined />}
            iconPosition="start"
          />
          <CustomisedButton variant="outlined" size="medium" label="Close " />
          <CustomisedButton
            variant="outlined"
            size="medium"
            label="Apply"
            Icon={<EditOutlined />}
            iconPosition="start"
          />
        </Grid>
      </CustomisedModal>
    </Grid>
  );
}
