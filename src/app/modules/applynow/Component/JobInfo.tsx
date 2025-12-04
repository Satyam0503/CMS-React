import { useState } from "react";
import { JobModal } from "../../recruitment/models";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import ApplyJobForm from "./ApplyJobForm";

type Props = {
  selectedJob: JobModal | undefined;
  activeJobPositionsList: Array<JobModal>;
  handleChangePostion: (job: JobModal | undefined) => void;
};

export default function JobInfo(props: Props) {
  const { formatMessage: i } = useIntl();
  const [isApplyFormOpen, setApplyFormOpen] = useState<boolean>(false);

  function handleClose() {
    setApplyFormOpen(false);
  }

  return (
    <Stack spacing={2}>
      <Box
        component={"div"}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "600",
          }}
        >
          {i({ id: "JOB.DESCRIPTION" })}
        </Typography>
        <Button
          variant="contained"
          sx={{
            width: "30%",
            display: {
              xs: "none",
              sm: "flex",
            },
          }}
          onClick={() => setApplyFormOpen(true)}
        >
          {i({ id: "BUTTON.APPLY" })}
        </Button>
      </Box>

      <Stack>
        {props.selectedJob && (
          <Stack>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{
                __html: props.selectedJob.description,
              }}
              sx={{
                fontWeight: 400,
              }}
            />
            <Box
              component="div"
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Button
                variant="contained"
                sx={{
                  width: "150px",
                  display: {
                    xs: "flex",
                    sm: "none",
                  },
                }}
                onClick={() => setApplyFormOpen(true)}
              >
                {i({ id: "BUTTON.APPLY" })}
              </Button>
            </Box>
            {
              isApplyFormOpen &&
              <ApplyJobForm
                selectedJob={props.selectedJob}
                handleChangePostion={props.handleChangePostion}
                activeJobPositionsList={props.activeJobPositionsList}
                open={isApplyFormOpen}
                handleClose={handleClose}
              />
            }
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
