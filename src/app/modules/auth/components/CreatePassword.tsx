import { useState } from "react";

import { Box, Checkbox, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";

import { useAppDispatch } from "../../../Redux/hooks";
import { colors } from "../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export function CreatePassword() {
  const [loading, setLoading] = useState(false);
  const intl = useIntl();
  const dispatch = useAppDispatch();

  return (
    <Stack spacing={{ xs: 4 }}>
      <Stack
        direction={"row"}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Stack spacing={1}>
          <Typography variant="h1" color={colors.alpha.primary[500]}>
            {intl.formatMessage({ id: "PASSWORD.CREATE" })}
          </Typography>
          <Typography variant="h3">
            {intl.formatMessage({ id: "PASSWORD.CREATE_LOGIN" })}
          </Typography>
        </Stack>
        <Stack display={{ xs: "none", md: "block" }}>
          <img
            src={toAbsoluteUrl("media/auth/authentication.svg")}
            style={{ maxWidth: "250px" }}
          />
        </Stack>
      </Stack>
      <form>
        <Stack spacing={2}>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
            </Typography>
            <TextField fullWidth placeholder="email" type="email" />
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "PASSWORD.CREATE_NEW" })}
            </Typography>
            <TextField
              fullWidth
              placeholder="min 8 characters containing uppercase, numeric & special charater"
              type="password"
            />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "PASSWORD.CONFIRMATION" })}
            </Typography>
            <TextField fullWidth placeholder="Password" type="password" />
          </Stack>

          <Stack direction={"row"} alignItems={"center"}>
            <Checkbox sx={{ pl: 0 }} />
            <Box component="span">
              <Typography
                variant="body1"
                color={colors.alpha.primary[500]}
                fontWeight={600}
              >
                {intl.formatMessage({ id: "AUTH.TERMS.CONFIRMATION" })}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={0.5}>
            <CustomisedButton
              type="submit"
              label="Create Password"
              size="large"
              loading={loading}
            />
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}
