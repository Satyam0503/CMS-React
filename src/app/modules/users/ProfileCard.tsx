import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  darken,
  Grid,
  IconButton,
  InputLabel,
  lighten,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Zoom,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  AttachFile,
  CloudUploadOutlined,
  Download,
  Edit,
  Image,
  Opacity,
  Visibility,
} from "@mui/icons-material";
import { useState } from "react";

// import { updateUserAvatar } from "./userservices";

import { CustomisedModal } from "../components/CustomisedModal";
import CustomisedButton from "../components/CustomisedButton";
import { useAppSelector } from "../../Redux/hooks";
import { colors } from "../theme/MuiTheme";
import { CustomIconButton } from "../components/CustomIconButton";
import { useUserDetails } from "./UserDataProvider";
import { getAgeInYears } from "../../../utils/common";
import { EmployeeModel } from "../../../utils/common_types";

export default function ProfileCard() {
  const user = useAppSelector((state) => state.user.userData);
  const token = useAppSelector((state) => state.auth.token)!;
  const [open, setOpen] = useState(false);
  const [seletedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const intl = useIntl();
  const [userPersonalDetails, setUserPersonalDetails] = useState(
    {} as EmployeeModel
  );
  const [isAvatarZoomedOut, setIsAvatarZoomedOut] = useState(false);
  function handleClose() {
    setOpen(false);
    setSelectedFile(null);
    setFileError("");
  }
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setFileError("Please select a image");
      return;
    }
    const selectedFile = files[0];
    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    if (fileSizeInMB > 2) {
      setFileError("File size should be less 2MB");
      return;
    }
    setSelectedFile(selectedFile);
    setFileError("");
  }

  // function handleUpdateAvatar() {
  //   if (seletedFile) {
  //     const formData = new FormData();
  //     formData.append("avatar", seletedFile);
  //     updateUserAvatar(formData, token)
  //       .then((res) => {
  //         toast.success("Avatar updated successfully");
  //         handleClose();
  //       })
  //       .catch((error) => {
  //         toast.error("Something went wrong");
  //         console.log(error);
  //       });
  //   }
  // }
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
          sx={{
            height: "150px",
            width: "150px",
            border: "1px solid white",
            borderRadius: "50%",
            position: "relative",
            transition: "transform 0.3s ease-in-out",
            "&:hover img": {
              opacity: 0.2,
              zIndex: 1,
            },
          }}
        >
          <Avatar
            alt="profile picture"
            src="media/avatars/300-1.jpg"
            sx={{
              width: "100%",
              height: "100%",
              transform: isAvatarZoomedOut ? "scale(1.4)" : "scale(1)",
            }}
          />

          <Stack className="coverChange" direction={"row"} gap={1} zIndex={3}>
            <CustomIconButton
              handleClick={() => setOpen(true)}
              icon={
                <Image
                  sx={{
                    color: "white",
                    "&:hover": {
                      color: colors.alpha.primary[500],
                    },
                  }}
                />
              }
            />
            <CustomIconButton
              handleClick={() => setIsAvatarZoomedOut((prev) => !prev)}
              icon={
                <Visibility
                  sx={{
                    color: "white",
                    "&:hover": {
                      color: colors.alpha.primary[500],
                    },
                  }}
                />
              }
            />
          </Stack>
        </Grid>
        <Stack textAlign={"center"} alignItems={"center"}>
          <Typography variant="h5" color={"white"} mb={0.5}>
            {user?.firstName + " " + user?.lastName}
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
            {userPersonalDetails.jobRole || "NA"}
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
              {getAgeInYears(userPersonalDetails.dateOfBirth!) || "NA"}
            </Typography>
            <Typography variant="body2" color={"white"}>
              {intl.formatMessage({ id: "USER.AGE" })}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h2" color={"white"}>
              {userPersonalDetails.bloodGroup || "NA"}
            </Typography>
            <Typography variant="body2" color={"white"}>
              {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
            </Typography>
          </Stack>
        </Stack>
        <CustomisedButton
          variant="contained"
          Icon={<Download />}
          iconPosition="start"
          label="Salary slip"
        />
      </Card>
      {open && (
        <CustomisedModal open={open} handleClose={handleClose}>
          <Box>
            <Typography variant="h5">
              {intl.formatMessage({ id: "UPLOAD.PROFILE_PICTURE" })}
            </Typography>
            <Stack
              direction={"column"}
              spacing={1}
              sx={{ marginBlockStart: 2 }}
            >
              <Box
                component="label"
                sx={{
                  border: "1px dashed grey",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              >
                <Container
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Grid item xs={6} md={6} textAlign={"center"}>
                    <CloudUploadOutlined
                      fontSize="large"
                      sx={{ margin: "auto" }}
                    />
                    <input
                      type="file"
                      accept=".jpg,.png,.webp"
                      onChange={handleFileChange}
                      hidden
                    />
                    <Typography variant="body1" flexWrap={"wrap"}>
                      {intl.formatMessage({ id: "FILE.SELECTED" })}:
                      {seletedFile?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <Typography variant="body2" flexWrap={"wrap"}>
                      {intl.formatMessage({ id: "FILE.UPLOAD_INSTRUCTION" })}
                    </Typography>
                  </Grid>
                </Container>
              </Box>

              <CustomisedButton
                label="Upload File"
                Icon={<AttachFile />}
                iconPosition="end"
                disabled={!seletedFile}
                // handleClick={handleUpdateAvatar}
              />

              {fileError && (
                <Typography variant="body2" color={colors.alpha.danger[800]}>
                  {fileError}
                </Typography>
              )}
            </Stack>
          </Box>
        </CustomisedModal>
      )}
    </>
  );
}
