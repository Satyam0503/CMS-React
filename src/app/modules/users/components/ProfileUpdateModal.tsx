import { FC, useRef, useState } from "react";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import {
  AttachFile,
  CloudUploadOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";
import { updateProfilePicture } from "../userservices";
import { setCurrentUser } from "../../../Redux/Reducers/userSlice";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { ImageCropper } from "./ImageCropper";
import { useUserDetails } from "../UserDataProvider";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SupportedImageFormat = ["jpg", "jpeg", "png"];
const MAX_IMAGE_SIZE = 5;

export const PictureUpdateModal: FC<Props> = ({ open, handleClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState("");
  const [fileError, setFileError] = useState("");
  const userData = useAppSelector((state) => state.user.userData)!;

  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropperOpen, setCropperOpen] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setFileError("Please select a image");
      return;
    }
    const selectedFile = files[0];
    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    const fileFormat = selectedFile.name.split(".").pop()!;

    if (fileSizeInMB > MAX_IMAGE_SIZE) {
      setFileError("File size should be less then 5MB");
      return;
    }

    if (!SupportedImageFormat.includes(fileFormat.toLowerCase())) {
      setFileError("Only .jpg, .jpeg or .png images are allowed");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result as string);
      setCropperOpen(true);
    });
    reader.readAsDataURL(selectedFile);
    setSelectedImage(selectedFile);
    setFileError("");
  }

  const handleUpdateAvatar = async () => {
    if (croppedImage && selectedImage) {
      const formData = new FormData();
      const base64Image = croppedImage.split(",")[1];
      const blob = new Blob(
        [
          new Uint8Array(
            atob(base64Image)
              .split("")
              .map((c) => c.charCodeAt(0))
          ),
        ],
        {
          type: selectedImage.type,
        }
      );

      formData.append("profilePicture", blob, selectedImage.name);
      try {
        const response = await updateProfilePicture(formData);
        const { success, methodResult } = response.data;
        if (success) {
          dispatch(setCurrentUser({ ...userData, profileImage: methodResult }));
          handleClose();
          toast.success("Profile Updated Successfully");
        }
      } catch (error) {
        toast.error("Request Failed");
      }
    }
  };

  const handleImageCropDiscard = () => {
    setSelectedImage(null);
    setImgSrc("");
    setCropperOpen(false);
  };
  const handleImageCropSuccess = (croppedImageDataUrl: string) => {
    setCroppedImage(croppedImageDataUrl);
    setCropperOpen(false);
  };
  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Box>
          <Typography variant="h5">
            {intl.formatMessage({ id: "UPLOAD.PROFILE_PICTURE" })}
          </Typography>
          <Stack direction={"column"} spacing={2} sx={{ marginBlockStart: 2 }}>
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
                  <Typography variant="body1" flexWrap="wrap">
                    {intl.formatMessage({ id: "FILE.SELECTED" })}:
                    {selectedImage?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6}>
                  <Typography variant="body2" flexWrap="wrap">
                    {intl.formatMessage({ id: "FILE.UPLOAD_INSTRUCTION" })}
                  </Typography>
                </Grid>
              </Container>
            </Box>
            <Stack
              spacing={1}
              direction={"row"}
              className="justify-content-end"
            >
              <CustomisedButton
                variant="outlined"
                label="Delete File"
                Icon={<DeleteOutlineOutlined />}
                handleClick={() => { }}
              />
              <CustomisedButton
                label="Upload File"
                Icon={<AttachFile />}
                disabled={!selectedImage}
                handleClick={handleUpdateAvatar}
              />
            </Stack>

            {fileError && <ErrorLabel>{fileError}</ErrorLabel>}
          </Stack>
        </Box>
      </CustomisedModal>

      {isCropperOpen && (
        <ImageCropper
          open={isCropperOpen}
          handleClose={handleImageCropDiscard}
          imgSrc={imgSrc}
          handleCrop={handleImageCropSuccess}
          circularCrop={true}
        />
      )}
    </>
  );
};
