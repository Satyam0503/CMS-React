import { Stack, Typography, Grid, Card, Avatar, Button } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";
import { colors } from "../../../theme/MuiTheme";

export default function EmpOfMonth() {
  const intl = useIntl();
  return (
    <>
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>
          {intl.formatMessage({ id: "MENU.EMP_OF_MONTH" })}
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
              1st
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
              2nd
            </Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
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
              <Typography variant="body1">Ramesh Singh</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "POSITION.QA" })}
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="subtitle2" color={colors.alpha.primary[500]}>
              3rd
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </>
  );
}
