import {
  Button,
  Card,
  Grid,
  IconButton,
  Input,
  ListItem,
  ListItemText,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { Download, Edit, Image, Visibility } from "@mui/icons-material";

export default function ProfileCard() {
  const intl = useIntl();
  const Input = styled("input")({
    display: "none",
  });
  return (
    <Card className="bg-primary text-white d-flex flex-column align-items-center p-6 w-100 gap-6">
      <Stack
        className="container"
        sx={{
          height: "150px",
          width: "150px",
          position: "relative",
          borderRadius: "50%",
          alignItems: "center",
          border: "1px solid white",
        }}
      >
        <img
          src={toAbsoluteUrl("media/avatars/300-6.jpg")}
          alt=""
          style={{
            height: "128px",
            width: "128px",
            top: "10px",
            position: "absolute",
            borderRadius: "50%",
          }}
        />

        <Stack className="coverChange">
          <Input
            accept="image/*"
            id="icon-button-file"
            name="icon-button-file"
            type="file"
          />
          <label htmlFor="icon-button-file">
            <IconButton
              component="span"
              sx={{ background: "transparent", zIndex: "2" }}
            >
              <Image sx={{ fill: "white" }} />
            </IconButton>
          </label>
          <Input />

          {/* <IconButton component="span" sx={{ background: "transparent" }}>
            <Visibility sx={{ fill: "white" }} />
          </IconButton> */}
        </Stack>
      </Stack>

      <Stack>
        <Typography variant="h5" sx={{ color: "white" }}>
          Ganesh Singh
        </Typography>
        <Typography
          variant="body2"
          className="rounded-pill p-1 bg-opacity-25 bg-white mt-1 text-center text-white"
        >
          {intl.formatMessage({ id: "POSITION.DOT_NET" })}
        </Typography>
      </Stack>
      <Stack className="d-flex flex-row justify-content-around text-center w-100">
        <Stack>
          <Typography variant="h2" className="text-white">
            27
          </Typography>
          <Typography variant="body2" className="text-white">
            Years Old
          </Typography>
        </Stack>
        <Stack>
          <Typography variant="h2" className="text-white">
            O+
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
  );
}
