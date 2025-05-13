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
import { CustomCard } from "../../../shared/components/CustomCard";

export default function EmpOnLeave() {
  const intl = useIntl();
  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.LEAVE" })}>
        <Stack
          sx={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <Stack>
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
                <Typography
                  variant="subtitle2"
                  color={colors.primary[500]}
                >
                  5-Dec to 25-Dec
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
                  <Typography variant="body1">Satish Singh</Typography>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.primary[500]}
                >
                  Today
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack>
            <Link href="employeeonleave" underline="always">
              {"See more"}
            </Link>
          </Stack>
        </Stack>
      </CustomCard>
    </>
  );
}
