import {
  Typography,
  Card,
  Grid,
  Stack,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Check, Visibility } from "@mui/icons-material";
import EmployeePerformance from "./EmployeePerformance";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { colors } from "../../theme/MuiTheme";
import { CustomCard } from "../../../shared/components/CustomCard";

type Props = {
  className: string;
};

export default function NoticeBoard() {
  const intl = useIntl();
  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}>
        <Stack
          display={"flex"}
          justifyContent={"space-between"}
          flexDirection={"row"}
          alignItems={"center"}
          mb={1}
          gap={4}
        >
          <Stack direction="row" gap={1}>
            <Stack className="symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                alt=""
                style={{ borderRadius: "50%" }}
              />
            </Stack>
            <Stack>
              <Typography variant="body1">Dinesh Chauhan</Typography>
              <Typography variant="body2">Outlines keep you honest.</Typography>
              <Typography variant="subtitle2" color={colors.alpha.primary[500]}>
                10 mins ago
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" display={"flex"} alignItems={"center"} gap={1}>
            <IconButton>
              <Check />
            </IconButton>

            <IconButton>
              <Visibility />
            </IconButton>
          </Stack>
        </Stack>

        <Grid className="separator mb-4"></Grid>
        <Stack
          display={"flex"}
          justifyContent={"space-between"}
          flexDirection={"row"}
          alignItems={"center"}
          mb={1}
          gap={4}
        >
          <Stack direction="row" gap={1}>
            <Stack className="symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                alt=""
                style={{ borderRadius: "50%" }}
              />
            </Stack>
            <Stack>
              <Typography variant="body1">Ajay Rana</Typography>
              <Typography variant="body2">
                Outlines keep you honest. They stop you from indulging in poorly
                thought-out
              </Typography>
              <Typography variant="subtitle2" color={colors.alpha.primary[500]}>
                1 Hour ago
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" display={"flex"} alignItems={"center"} gap={1}>
            <IconButton>
              <Check />
            </IconButton>
            <IconButton>
              <Visibility />
            </IconButton>
          </Stack>
        </Stack>
      </CustomCard>
    </>
  );
}
