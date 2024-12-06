import {
  Button,
  Card,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { Download } from "@mui/icons-material";

export default function ProfileCard() {
  const intl = useIntl();
  return (
    <Card className="bg-primary text-white d-flex flex-column align-items-center p-6 w-100 gap-6">
      <Stack className="rounded-circle border p-2">
        <img
          src={toAbsoluteUrl("media/avatars/300-6.jpg")}
          alt=""
          className="rounded-circle"
          style={{ height: "128px" }}
        />
      </Stack>
      <Stack>
        <Typography variant="h5">Ganesh Singh</Typography>
        <Typography
          variant="body2"
          className="rounded-pill p-1 bg-opacity-25 bg-white mt-1 text-center"
        >
          {intl.formatMessage({ id: "POSITION.DOT_NET" })}
        </Typography>
      </Stack>
      <Stack className="d-flex flex-row justify-content-around text-center w-100">
        <Stack>
          <Typography variant="h2" className="text-white">
            27
          </Typography>
          <Typography variant="body2">Years Old</Typography>
        </Stack>
        <Stack>
          <Typography variant="h2" className="text-white">
            O+
          </Typography>
          <Typography variant="body2"> {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}</Typography>
        </Stack>
      </Stack>

      <Button variant="outlined" size="medium" className="border px-3">
        <Typography variant="body2">
          <Download /> {intl.formatMessage({ id: "POSITION.DOT_NET" })}
        </Typography>
      </Button>
    </Card>
  );
}
