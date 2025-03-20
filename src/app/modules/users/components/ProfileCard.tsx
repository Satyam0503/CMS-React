import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  darken,
  Grid,
  lighten,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  AttachFile,
  CloudUploadOutlined,
  Delete,
  DeleteForeverOutlined,
  DeleteOutline,
  DeleteOutlineOutlined,
  Download,
  Image,
  Visibility,
} from "@mui/icons-material";
import { useState } from "react";
import { useUserDetails } from "../UserDataProvider";
import { useAppSelector } from "../../../Redux/hooks";
import { updateProfilePicture } from "../userservices";
import { toast } from "react-toastify";
import { colors } from "../../theme/MuiTheme";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { getDateDiffInYears } from "../../../../utils/common";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";

export default function ProfileCard() {
  const [open, setOpen] = useState(false);
  const [seletedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const intl = useIntl();
  const { userDetails, setRefresh } = useUserDetails();
  const profileImageUrl = useAppSelector((state) => state.user.profileImageUrl);

  function handleClose() {
    setOpen(false);
    setSelectedFile(null);
    setFileError("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const supportedImageFormat = ["jpg", "jpeg", "png"];
    const files = event.target.files;
    if (!files || files.length === 0) {
      setFileError("Please select a image");
      return;
    }
    const selectedFile = files[0];
    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    const fileFormat = selectedFile.name.split(".").pop()!;

    if (fileSizeInMB > 2) {
      setFileError("File size should be less then 2MB");
      return;
    }

    if (!supportedImageFormat.includes(fileFormat.toLowerCase())) {
      setFileError("Only .jpg, .jpeg or .png images are allowed");
      return;
    }
    setSelectedFile(selectedFile);
    setFileError("");
  }

  async function handleUpdateAvatar() {
    if (seletedFile) {
      const formData = new FormData();
      formData.append("profilePicture", seletedFile);
      try {
        const response = await updateProfilePicture(formData);
        const { success } = response.data;
        if (success) {
          toast.success("Profile Updated Successfully");
          setRefresh();
          handleClose();
        }
      } catch (error) {
        toast.error("Request Failed");
      }
    }
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
            "&:hover img": {
              opacity: 0.2,
            },
          }}
          className="gridContainer"
        >
          <Avatar
            alt=""
            src={profileImageUrl}
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
                <Image
                  sx={{
                    color: "white",
                  }}
                />
              }
            />
            <CustomIconButton
              // handleClick={}
              icon={
                <Visibility
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
            {userDetails.jobRole || "NA"}
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
              {userDetails.bloodGroup || "NA"}
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
              spacing={2}
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
                      accept=".jpg,.png"
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
              <Stack spacing={0.5}>
                <CustomisedButton
                  label="Upload File"
                  Icon={<AttachFile />}
                  iconPosition="end"
                  disabled={!seletedFile}
                  handleClick={handleUpdateAvatar}
                />
              </Stack>

              {fileError && <ErrorLabel>{fileError}</ErrorLabel>}
            </Stack>
          </Box>
          <Stack mt={1}>
            <CustomisedButton
              variant="outlined"
              label="Delete File"
              Icon={<DeleteOutlineOutlined />}
              iconPosition="end"
              handleClick={handleUpdateAvatar}
              style={{
                visibility: !seletedFile ? "hidden" : "visible",
                color: colors.alpha.danger[500],
              }}
            />
          </Stack>
        </CustomisedModal>
      )}
    </>
  );
}
