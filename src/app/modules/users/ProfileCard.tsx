import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  InputLabel,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import {
  AttachFile,
  CloudUploadOutlined,
  Download,
  Edit,
  Image,
  Visibility,
} from "@mui/icons-material";
import { useState } from "react";
import { updateUserAvatar } from "./userservices";
import { toast } from "react-toastify";
import { CustomisedModal } from "../components/CustomisedModal";
import CustomisedButton from "../components/CustomisedButton";

const token = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");
// const id= "66c5ea2f-6cfd-445d-b215-09dd3667c8c5";

type ProfileInfo = {
  name?: string;
  age?: number;
  bloodGroup?: string;
  designation?: string;
};

export default function ProfileCard(props: ProfileInfo) {
  const [open, setOpen] = useState(false);
  const [seletedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const intl = useIntl();
  const { name, age, bloodGroup, designation } = props;

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
  function handleUpdateAvatar() {
    if (seletedFile) {
      const formData = new FormData();
      formData.append("avatar", seletedFile);
      updateUserAvatar(formData, token)
        .then((res) => {
          toast.success("Avatar updated successfully");
          handleClose();
        })
        .catch((error) => {
          toast.error("Something went wrong");
          console.log(error);
        });
    }
  }
  return (
    <>
      <Card className="bg-primary text-white d-flex flex-column align-items-center p-6 w-100 gap-6">
        <Stack
          className="container position-relative border rounded-circle "
          style={{ height: "150px", width: "150px" }}
        >
          <img
            src={toAbsoluteUrl("media/avatars/300-6.jpg")}
            alt=""
            className="rounded-circle position-absolute   "
            style={{ height: "128px", width: "128px", top: "10px" }}
          />

          <Stack className="coverChange" direction={"row"}>
            <IconButton className="profile" onClick={() => setOpen(true)}>
              <Image
                sx={{
                  border: "1px solid white",
                  borderRadius: "4px",
                  marginRight: "5px",
                }}
              />
            </IconButton>
            <IconButton>
              <Visibility
                sx={{
                  border: "1px solid white",
                  borderRadius: "4px",
                }}
              />
            </IconButton>
          </Stack>
        </Stack>

        <Stack>
          <Typography variant="h5" sx={{ color: "white" }}>
            {name}
          </Typography>
          <Typography
            variant="body2"
            className="rounded-pill p-1 bg-opacity-25 bg-white mt-1 text-center text-white"
          >
            {designation}
          </Typography>
        </Stack>
        <Stack className="d-flex flex-row justify-content-around text-center w-100">
          <Stack>
            <Typography variant="h2" className="text-white">
              {age}
            </Typography>
            <Typography variant="body2" className="text-white">
              Years Old
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h2" className="text-white">
              {bloodGroup}
            </Typography>
            <Typography variant="body2" className="text-white">
              {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="outlined"
          size="medium"
          className="border px-3 bg-primary text-white"
        >
          <Typography variant="body2" className="text-white">
            <Download /> {intl.formatMessage({ id: "POSITION.DOT_NET" })}
          </Typography>
        </Button>
      </Card>
      {open && (
        <CustomisedModal open={open} handleClose={handleClose}>
          <Box>
            <Typography variant="h5">Select a Avatar File</Typography>
            <Stack
              direction={"column"}
              spacing={1}
              sx={{ marginBlockStart: 2 }}
            >
              <Box
                component="label"
                sx={{
                  p: 2,
                  border: "1px dashed grey",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              >
                <CloudUploadOutlined fontSize="large" sx={{ margin: "auto" }} />
                <input
                  type="file"
                  accept=".jpg,.png,.webp"
                  onChange={handleFileChange}
                  hidden
                />
                <Typography>Selected File: {seletedFile?.name}</Typography>
              </Box>
              <Typography variant="body1">
                Note : Please select .jpg/.png/.webp images upto 2 MB
              </Typography>
              <CustomisedButton
                label="Upload File"
                Icon={<AttachFile/>}
                iconPosition="end"
                disabled={!seletedFile}
                handleClick={handleUpdateAvatar}
              />

              {fileError && (
                <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                  {" "}
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
