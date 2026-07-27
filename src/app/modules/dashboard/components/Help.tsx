import { Stack, Typography, Grid } from "@mui/material";
import { useIntl } from "react-intl";
import { Message } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/C_Button";
import { CustomCard } from "../../../shared/components/C_Card";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export default function Help() {
  const intl = useIntl();
  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.HELP" })}>
        <Stack sx={{
          position: "relative"
        }}>
          <Grid
            size={7}
            sx={{
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3
            }}>
            <Stack>
              <Typography variant="body2">
                {intl.formatMessage({ id: "MENU.HELP_INFO" })}
              </Typography>
            </Stack>

            <Stack
              direction={"row"}
              sx={{
                display: "flex",
                justifyContent: "flex-start"
              }}>
              <CustomisedButton
                variant="contained"
                label="Contact"
                Icon={<Message />}
              />
            </Stack>
          </Grid>

          <Stack
            direction={"row"}
            sx={{
              height: "200px",
              display: "flex",
              justifyContent: "flex-end",
              position: "absolute",
              zIndex: 0,
              right: 0
            }}>
            <img
              src={toAbsoluteUrl("media/auth/need_help.svg")}
              width={"100%"}
              height={"100%"}
            />
          </Stack>
        </Stack>
      </CustomCard>
    </>
  );
}
