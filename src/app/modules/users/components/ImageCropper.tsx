import { FC, useState } from "react";
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
import { colors } from "../../theme/MuiTheme";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SupportedImageFormat = ["jpg", "jpeg", "png"];
const MAX_IMAGE_SIZE = 5;
const MIN_DIMENSION = 150;

export const ImageCropper: FC<Props> = ({ open, handleClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState("");
  const [fileError, setFileError] = useState("");
  const userData = useAppSelector((state) => state.user.userData)!;
  const [crop, setCrop] = useState<Crop>();
  const [croppedImage, setCroppedImage] = useState<string | null>(null); 

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
    });
    reader.readAsDataURL(selectedFile);
    setSelectedImage(selectedFile);
    setFileError("");
  }

  const handleUpdateAvatar = async () => {
    if (croppedImage && selectedImage) {
      const formData = new FormData();
      const base64Image = croppedImage.split(",")[1];
      const blob = new Blob([new Uint8Array(atob(base64Image).split("").map((c) => c.charCodeAt(0)))], {
        type: selectedImage.type,
      });

      formData.append("profilePicture", blob, selectedImage.name);
      try {
        const response = await updateProfilePicture(formData);
        const { success, methodResult } = response.data;
        if (success) {
          toast.success("Profile Updated Successfully");
          dispatch(setCurrentUser({ ...userData, profileImage: methodResult }));
          handleClose();
        }
      } catch (error) {
        toast.error("Request Failed");
      }
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: cropWidthInPercent,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const onCropComplete = (crop: Crop, pixelCrop: Crop) => {
    if (!imgSrc) return;
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          image,
          pixelCrop.x * scaleX,
          pixelCrop.y * scaleY,
          pixelCrop.width * scaleX,
          pixelCrop.height * scaleY,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        const base64 = canvas.toDataURL();
        setCroppedImage(base64);
      }
    };
  };
  return (
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
                <CloudUploadOutlined fontSize="large" sx={{ margin: "auto" }} />
                <input
                  type="file"
                  accept=".jpg,.png"
                  onChange={handleFileChange}
                  hidden
                />
                <Typography variant="body1" flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "FILE.SELECTED" })}:
                  {selectedImage?.name}
                </Typography>
              </Grid>
              <Grid item xs={6} md={6}>
                <Typography variant="body2" flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "FILE.UPLOAD_INSTRUCTION" })}
                </Typography>
              </Grid>
            </Container>
          </Box>
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              circularCrop
              keepSelection
              aspect={1}
              minHeight={MIN_DIMENSION}
              onComplete={onCropComplete}
            >
              <img src={imgSrc} alt="Upload" onLoad={onImageLoad} />
            </ReactCrop>
          )}
          <Stack spacing={1} direction={"row"} className="justify-content-end">
            <CustomisedButton
              variant="outlined"
              label="Delete File"
              Icon={<DeleteOutlineOutlined />}
              iconPosition="end"
              handleClick={handleUpdateAvatar}
              style={{
                visibility: !selectedImage ? "hidden" : "visible",
                color: colors.alpha.danger[500],
              }}
            />
            <CustomisedButton
              label="Upload File"
              Icon={<AttachFile />}
              iconPosition="end"
              disabled={!selectedImage}
              handleClick={()=>{}}
            />
          </Stack>

          {fileError && <ErrorLabel>{fileError}</ErrorLabel>}
        </Stack>
      </Box>
    </CustomisedModal>
  );
};
