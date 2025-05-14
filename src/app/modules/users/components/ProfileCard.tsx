import { Avatar, Box, Card, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Download, Edit } from "@mui/icons-material";
import { useState } from "react";
import { useUserDetails } from "../UserDataProvider";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { getDateDiffInYears } from "../../../../utils/common";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { PictureUpdateModal } from "./ProfileUpdateModal";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";

export default function ProfileCard() {
  const [open, setOpen] = useState(false);
  const intl = useIntl();
  const { userDetails } = useUserDetails();
  const profileImage = useAppSelector(
    (state) => state.user.userData?.profileImage
  );
  const employeeId = useParams().employeeid;

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Card className="profile-picture-card">
        <Box className="profile-picture">
          <Avatar
            src={employeeId ? userDetails.fullProfileUrl : profileImage}
            className="w-100 h-100"
          />
          {!employeeId && (
            <Stack className="profile-picture-cover" direction={"row"} gap={1}>
              <CustomIconButton
                handleClick={() => setOpen(true)}
                tooltip="Upload profile picture"
                icon={
                  <Edit
                    sx={{
                      color: "common.white",
                    }}
                  />
                }
              />
            </Stack>
          )}
        </Box>
        <Stack className="text-center align-items-center" spacing={1}>
          <Typography variant="h5" color="common.white">
            {userDetails?.firstName + " " + userDetails?.lastName}
          </Typography>
          <Typography
            variant="body2"
            color="common.white"
            className="px-4 py-2 rounded-pill"
          >
            {userDetails.jobRole || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Stack>
        <Stack
          direction={"row"}
          justifyContent={"space-around"}
          textAlign={"center"}
        >
          <Stack>
            <Typography variant="h2" color="common.white">
              {getDateDiffInYears(userDetails.dateOfBirth!) || "NA"}
            </Typography>
            <Typography variant="body2" color="common.white">
              {intl.formatMessage({ id: "USER.AGE" })}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h2" color="common.white">
              {userDetails.bloodGroup || (
                <FormattedMessage id="NOT_AVAILABLE" />
              )}
            </Typography>
            <Typography variant="body2" color="common.white">
              {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
            </Typography>
          </Stack>
        </Stack>
        {!employeeId && (
          <CustomisedButton
            variant="contained"
            Icon={<Download />}
            iconPosition="start"
            className="align-self-center"
            label={intl.formatMessage({ id: "DOWNLOAD.SALARY_SLIP" })}
          />
        )}
      </Card>
      {open && <PictureUpdateModal open={open} handleClose={handleClose} />}
    </>
  );
}
