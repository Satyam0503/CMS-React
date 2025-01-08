import {
  Stack,
  Typography,
  Grid,
  Card,
  Avatar,
  Button,
  Link,
} from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { colors } from "../../theme/MuiTheme";

export default function UpcomingBirthday() {
  const intl = useIntl();
  return (
    <>
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>
          {intl.formatMessage({ id: "MENU.BIRTHDAY" })}
        </Typography>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          mb={1}
        >
          <Stack direction="row">
            <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
              <img
                src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                alt=""
                style={{ borderRadius: "50%" }}
              />
            </Stack>
            <Stack>
              <Typography variant="body1">Deepak Chaurasiya</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "POSITION.QA" })}
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="subtitle2" color={colors.alpha.primary[500]}>
              Today
            </Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          mb={1}
        >
          <Stack direction="row">
            <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
              <img
                src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                alt=""
                style={{ borderRadius: "50%" }}
              />
            </Stack>
            <Stack>
              <Typography variant="body1">Mohan Singh</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "POSITION.QA" })}
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="subtitle2" color={colors.alpha.primary[500]}>
              5-Jan
            </Typography>
          </Stack>
        </Stack>
        <Link href="birthday" underline="always">
          {"See more"}
        </Link>
      </Card>
    </>
  );
}
