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
      <CustomisedModal open={open} handleClose={handleClose}>
        <Grid container display={"flex"} direction={"column"} gap={1}>
          <Grid item xs={12}>
            <Typography variant="h5" mb={2}>
              {intl.formatMessage({ id: "JOB.DESCRIPTION" })}
            </Typography>
          </Grid>
          <Grid item xs={12} display={"flex"} gap={1}>
            <Grid item xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "FORM.TITLE" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <TextField fullWidth />
            </Grid>
          </Grid>

          <Grid item xs={12} display={"flex"} gap={1}>
            <Grid item xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.VACANCIES" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <TextField fullWidth />
            </Grid>
          </Grid>

          <Grid item xs={12} display={"flex"} gap={1}>
            <Grid item xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>On-site</MenuItem>
                <MenuItem>Remote</MenuItem>
                <MenuItem>Hybrid</MenuItem>
                <MenuItem>Part-time</MenuItem>
              </Select>
            </Grid>
          </Grid>

          <Grid item xs={12} display={"flex"} gap={1}>
            <Grid item xs={4} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
            </Grid>
            <Grid item xs={8} md={6}>
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
