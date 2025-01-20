import {
  Add,
  Check,
  EditOutlined,
  FileCopyOutlined,
  FileOpenOutlined,
  FileUpload,
  LinkOutlined,
  Visibility,
} from "@mui/icons-material";
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import CustomisedButton from "../../../modules/components/CustomisedButton";
import TextEditor from "../../../modules/components/TextEditor";

type Props = {
  open: boolean;
  handleClose: () => void;
  // handleCommentsSubmission: (value: any) => void;
  // userComment: string;
  // handleChange: (value: any) => void;
};

const JobDescription = (props: Props) => {
  const [value, setValue] = useState("");
  const intl = useIntl();
  const { open, handleClose } = props;

  // const [open, setOpen] = useState(false);

  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  console.log(value);

  return (
    <Grid container>
      {/* <IconButton onClick={() => setOpen(true)}>
        <Add />
      </IconButton> */}
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
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Fullstack Developer</MenuItem>
                <MenuItem>Frontend Developer</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.LEVEL" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Senior</MenuItem>
                <MenuItem>Junior</MenuItem>
              </Select>
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
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Development</MenuItem>
                <MenuItem>Design</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.MODE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Online</MenuItem>
                <MenuItem>Offline</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Full-time</MenuItem>
                <MenuItem>Part-time</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>AK SINGH</MenuItem>
                <MenuItem>MOHIT RAI</MenuItem>
              </Select>
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
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Active</MenuItem>
                <MenuItem>Inactive</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Grid>

        <hr />

        {/* <Grid container>
          <TextEditor
            value={userComment}
            onChange={handleChange}
            placeholder="Add Comments"
            helperText={String("Please fill comment section")}
            className="rounded-5 "
            error={Boolean(!userComment)}
          />
        </Grid> */}
        <Stack>
          <Grid item xs={12}>
            <TextEditor value={value} setValue={setValue} />
          </Grid>
        </Stack>
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
            variant="contained"
            size="medium"
            label="Publish"
            Icon={<Check />}
            iconPosition="start"
          />
        </Grid>
      </CustomisedModal>
    </Grid>
  );
};

export default JobDescription;
