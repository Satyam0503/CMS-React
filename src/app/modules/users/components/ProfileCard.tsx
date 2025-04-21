import {
  alpha,
  Avatar,
  Box,
  Card,
  Container,
  Grid,
  lighten,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Download, Edit } from "@mui/icons-material";
import { useState } from "react";
import { useUserDetails } from "../UserDataProvider";
import { colors } from "../../theme/MuiTheme";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { getDateDiffInYears } from "../../../../utils/common";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { PictureUpdateModal } from "./ProfileUpdateModal";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { useParams } from "react-router-dom";

export default function ProfileCard() {
  const [open, setOpen] = useState(false);
  const intl = useIntl();
  const { userDetails } = useUserDetails();
  const employeeId = useParams().employeeid;
  
  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Card
        sx={{
          width: "100%",
          bgcolor: colors.alpha.primary[500],
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        <Grid
          container
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          p={1}
          mt={1}
          sx={{
            height: "150px",
            width: "150px",
            border: "1px solid white",
            borderRadius: "50%",
            position: "relative",
            transition: "transform 0.3s ease-in-out",
            zIndex: 0,
            "&:hover img": {
              opacity: 0.2,
            },
          }}
          className="gridContainer"
        >
          <Avatar
            alt=""
            // src={userData.profileImage}
            src={toAbsoluteUrl("media/avatars/300-6.jpg")} //static data for text purpose only, need to remove later and consider above commented data
            sx={{
              width: "100%",
              height: "100%",
            }}
          />

          <Stack className="coverChange" direction={"row"} gap={1}>
            <CustomIconButton
              handleClick={() => setOpen(true)}
              tooltip="Upload profile picture"
              icon={
                <Edit
                  sx={{
                    color: "white",
                  }}
                />
              }
            />
          </Stack>
        </Grid>
        <Stack textAlign={"center"} alignItems={"center"}>
          <Typography variant="h5" color={"white"} mb={0.5}>
            {userDetails?.firstName + " " + userDetails?.lastName}
          </Typography>
          <Typography
            variant="body2"
            color={"white"}
            borderRadius={2}
            py={0.5}
            px={1}
            sx={{
              backgroundColor: alpha(
                lighten(colors.alpha.white[500], 0.2),
                0.2
              ),
            }}
          >
            {userDetails.jobRole || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Stack>
        <Stack
          display={"flex"}
          direction={"row"}
          justifyContent={"space-around"}
          textAlign={"center"}
          width={"100%"}
        >
          <Stack>
            <Typography variant="h2" color={"white"}>
              {getDateDiffInYears(userDetails.dateOfBirth!) || "NA"}
            </Typography>
            <Typography variant="body2" color={"white"}>
              {intl.formatMessage({ id: "USER.AGE" })}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h2" color={"white"}>
              {userDetails.bloodGroup || (
                <FormattedMessage id="NOT_AVAILABLE" />
              )}
            </Typography>
            <Typography variant="body2" color={"white"}>
              {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
            </Typography>
          </Stack>
        </Stack>
        {!employeeId && (
          <CustomisedButton
            variant="contained"
            Icon={<Download />}
            iconPosition="start"
            label={intl.formatMessage({ id: "DOWNLOAD.SALARY_SLIP" })}
          />
        )}
      </Card>
      {open && <PictureUpdateModal open={open} handleClose={handleClose} />}
    </>
  );
}
