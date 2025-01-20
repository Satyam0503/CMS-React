import { useState } from "react";

import {
  Box,
  Checkbox,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";

import { useAppDispatch } from "../../../Redux/hooks";

export function CreatePassword() {
  const [loading, setLoading] = useState(false);
  const intl = useIntl();
  const dispatch = useAppDispatch();

  return (
    <Stack spacing={4}>
      <Stack sx={{ textAlign: "center" }}>
        <Typography variant="h3">
          {intl.formatMessage({ id: "PASSWORD.CREATE" })}
        </Typography>
      </Stack>
      <form>
        <Stack spacing={2}>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" })}
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

          <Stack>
            <Typography>
              <Checkbox />
              <Box component="span">
                I Accept the <Link to={"/"}>{"Terms & conditions"} </Link>
              </Box>
            </Typography>
          </Stack>

          <Stack spacing={1}>
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
