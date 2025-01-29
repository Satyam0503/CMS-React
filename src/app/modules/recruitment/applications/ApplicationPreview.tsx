import { Close, Download } from "@mui/icons-material";
import { Container, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import { CustomIconButton } from "../../components/CustomIconButton";
import { EditApplicant } from "./EditApplicant";

interface PropsType {
  open: boolean;
  handleClose: () => void;
  applicantData?: any;
}

export default function ApplicationPreview(props: PropsType) {
  const intl = useIntl();
  const { open, handleClose, applicantData } = props;

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
          <Typography variant="h5">Sohan Singh</Typography>
          <CustomIconButton icon={<Close />} handleClick={handleClose} />
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "USER.ROLE" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              USER.ROLE
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
              USER.ROLE
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "MENU.NOTICE_PERIOD" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              USER.ROLE
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "PROFILE.CURRENT_CTC" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              USER.ROLE
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "PROFILE.EXPECTED_CTC" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              USER.ROLE
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} display={"flex"}>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {intl.formatMessage({ id: "JOB.MODE" })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={400}>
              USER.ROLE
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
              USER.ROLE
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
              Active
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Container style={{ border: "1px solid", borderRadius: "1rem" }}>
        <Stack
          direction="row"
          sx={{ borderBottom: 1, p: 3 }}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Stack>
            <Typography variant="h6">
              {intl.formatMessage({ id: "USER.RESUME" })}:
            </Typography>
          </Stack>
          <Stack>
            <IconButton>
              <Download />
            </IconButton>
          </Stack>
        </Stack>
        <Stack>
          <Stack mt={2}>
            <Typography variant="h6">Sohan Singh</Typography>
            <Typography variant="body1">.Net Developer</Typography>
          </Stack>

          <Stack direction={"row"}>
            <Typography variant="body2">
              {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}: abc@xyz.com
            </Typography>
            |
            <Typography variant="body2">
              {intl.formatMessage({ id: "USER.PHONE" })}: (123) 456-7890
            </Typography>
            |
            <Typography variant="body2">
              {intl.formatMessage({ id: "PROFILE.LOCATION" })}: City, State
            </Typography>
            |<Typography variant="body2">LinkedIn Profile</Typography>
          </Stack>
          <hr />
          <Stack spacing={2}>
            <Typography variant="h6">
              {intl.formatMessage({ id: "PROFILE.EMPLOYMENT" })}
            </Typography>
            <Stack>
              <Typography variant="body1">Deloitte - .Net Developer</Typography>
              <Typography variant="body1">
                May 2018 - Present | City, State
              </Typography>
              <Typography variant="body1">
                Lorem ipsum is a dummy or placeholder text commonly used in
                graphic design, publishing, and web development.
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="body1">Deloitte - .Net Developer</Typography>
              <Typography variant="body1">
                May 2018 - Present | City, State
              </Typography>
              <Typography variant="body1">
                Lorem ipsum is a dummy or placeholder text commonly used in
                graphic design, publishing, and web development.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </CustomisedModal>
  );
}
