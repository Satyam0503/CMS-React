import { FC, useState } from "react";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import {
  AttachFile,
  CloudUploadOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";
import { removeProfilePicture, updateProfilePicture } from "../userservices";
import { setCurrentUser } from "../../../Redux/Reducers/userSlice";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { ImageCropper } from "./ImageCropper";

interface Props {
  open: boolean;
  handleClose: () => void;
}

const SupportedImageFormat = ["jpg", "jpeg", "png"];
const MAX_IMAGE_SIZE = 5;

export const PictureUpdateModal: FC<Props> = ({ open, handleClose }) => {
  const { formatMessage: i } = useIntl();
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
      setFileError("VALIDATION_ERR.SELECT_FILE");
      return;
    }
    const selectedFile = files[0];

    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    const fileFormat = selectedFile.name.split(".").pop()!;

    if (fileSizeInMB > MAX_IMAGE_SIZE) {
      setFileError("VALIDATION_ERR.PROFILE_PICTURE_SIZE");
      return;
    }

    if (!SupportedImageFormat.includes(fileFormat.toLowerCase())) {
      setFileError("VALIDATION_ERR.PICTURE_FORMAT");
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
          toast.success(i({ id: "TOAST.SUCCESS.PROFILE_PICTURE_UPDATE" }));
        }
      } catch (error) {
        toast.error("TOAST.FAILED.PROFILE_PICTURE_UPDATE");
      }
    }
  };

  const handlePictureRemove = async () => {
    try {
      const { data } = await removeProfilePicture();
      if (data.success) {
        dispatch(setCurrentUser({ ...userData, profileImage: null }));
        handleClose();
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  }
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
        <Stack spacing={2}>
          <Typography variant="h5">
            {i({ id: "PROFILE.IMAGE.UPLOAD_PICTURE" })}
          </Typography>

          <Box className="d-flex flex-column align-items-center p-4  rounded-1"
            component="label"
            sx={{
              border: "1px dashed grey",
              cursor: "pointer",
            }}
          >
            <CloudUploadOutlined className="fs-32" />
            <input
              type="file"
              accept=".jpg,.png"
              onChange={handleFileChange}
              hidden
            />
            <Typography variant="body1" sx={{
              flexWrap: "wrap"
            }}>
              {i({ id: "PROFILE.IMAGE.SELECTED_IMAGE" })}:
              {selectedImage?.name}
            </Typography>

            {
              fileError ? <ErrorLabel errorLabel={fileError} />
                :
                <Typography variant="body2" sx={{
                  flexWrap: "wrap"
                }}>
                  {i({ id: "PROFILE.IMAGE.INSTRUCTION" })}
                </Typography>
            }

          </Box>

          <Stack className="justify-content-end flex-row gap-2" >
            {
              userData.profileImage &&
              <CustomisedButton
                variant="outlined"
                color="error"
                label={i({ id: "BUTTON.REMOVE" })}
                Icon={<DeleteOutlineOutlined />}
                handleClick={handlePictureRemove}
              />
            }
            <CustomisedButton
              variant="outlined"
              label={i({ id: "BUTTON.CANCEL" })}
              handleClick={() => {
                handleImageCropDiscard();
                handleClose();
              }}
            />
            <CustomisedButton
              label={i({ id: "BUTTON.UPLOAD" })}
              Icon={<AttachFile />}
              disabled={!selectedImage}
              handleClick={handleUpdateAvatar}
            />
          </Stack>
        </Stack>
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
