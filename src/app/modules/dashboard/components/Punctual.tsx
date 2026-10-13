import { Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { CustomCard } from "../../../shared/components/C_Card";

export default function Punctual() {
  const intl = useIntl();
  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.TOP_PUNCTUAL" })}>
        <Stack
          direction="row"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1
          }}>
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
            <Typography variant="subtitle2">1st</Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1
          }}>
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
            <Typography variant="subtitle2">2nd</Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1
          }}>
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
            <Typography variant="subtitle2">3rd</Typography>
          </Stack>
        </Stack>
      </CustomCard>
    </>
  );
}
